import { json, error } from '@sveltejs/kit';
import { PaymentValidator } from '$lib/server/services/PaymentValidator';
import { rateLimiter } from '$lib/server/services/RateLimiter';
import prisma from '$lib/server/prisma';
import type { Cart, CartItem } from '@prisma/client';

export const POST = async ({ request }) => {
	console.log(request.headers); // TODO: Implement rate limiting and validation
	// const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

	// if (rateLimiter.isRateLimited(clientIp)) {
	// 	return json({ error: 'Too many requests' }, { status: 429 });
	// }

	// const signature = request.headers.get('x-payment-signature');
	// if (!signature) {
	// 	return json({ error: 'Missing signature' }, { status: 400 });
	// }

	try {
		const payload = await request.json();

		// Validate payload structure
		const validatedPayload = PaymentValidator.validateCallback(payload);

		// Verify signature
		// if (!PaymentValidator.verifySignature(payload, signature)) {
		// 	throw error(400, 'Invalid signature');
		// }

		if (validatedPayload?.status === 'settled') {
			return await processPayment(validatedPayload);
		}

		return json({ message: 'Notification acknowledged' });
	} catch (e: any) {
		console.error('Payment webhook error:', e);
		if (e instanceof Error) {
			return json(
				{ error: e.message },
				{
					status: e.message.includes('not found') ? 404 : 500
				}
			);
		}
		return error(e?.status || 500, e?.body?.message || 'Internal server error');
	}
};

async function processPayment(payload: any) {
	return await prisma.$transaction(
		async (tx) => {
			// Lock the cart for processing
			const cart = await tx.cart.findUnique({
				where: {
					paymentReference: payload.client_invoice_ref,
					status: 'PENDING_PAYMENT'
				},
				include: {
					CartItem: { include: { product: true } },
					user: true
				}
			});

			if (!cart?.CartItem?.length) {
				throw error(404, 'Cart not found or empty');
			}

			// Validate stock and prices
			// await validateCartItems(tx, cart);

			// Create order
			const order = await createOrder(tx, cart, payload);

			// Update inventory
			await updateInventory(tx, cart.CartItem);

			// Clear cart
			await tx.cart.delete({ where: { id: cart.id } });

			return json({ success: true, order });
		},
		{
			timeout: 10000,
			isolationLevel: 'Serializable'
		}
	);
}

// TODO: edge case: what if the product is deleted during payment processing?
async function validateCartItems(tx: any, cart: any) {
	for (const item of cart.CartItem) {
		if (item.quantity > item.product.quantity) {
			throw error(400, `Insufficient stock for product: ${item.product.name}`);
		}
	}
}

// Cart & {
// 	CartItem: (CartItem & {
// 		product: {
// 			price: number;
// 			id: string;
// 		};
// 	})[];
// 	user: {
// 		id: string;
// 	};

async function createOrder(tx: any, cart: any, payload: any) {
	const totalPrice = cart.CartItem.reduce((sum: any, item: any) => sum + item.product.price * item.quantity, 0);

	return await tx.order.create({
		data: {
			userId: cart.userId,
			totalPrice,
			status: 'COMPLETED',
			billRefNumber: payload.client_invoice_ref,
			invoiceNumber: payload.invoice_number,
			description: `Payment via ${payload.payment_channel}`,
			ProductOnOrder: {
				createMany: {
					data: cart.CartItem.map((item: any) => ({
						productId: item.productId,
						quantity: item.quantity
					}))
				}
			}
		},
		include: {
			ProductOnOrder: true
		}
	});
}

async function updateInventory(tx: any, cartItems: any) {
	await Promise.all(
		cartItems.map((item: any) =>
			tx.product.update({
				where: { id: item.productId },
				data: { quantity: { decrement: item.quantity } }
			})
		)
	);
}

/**
	 * Sample data from the notification url
	 *  {
  status: 'settled',
  secure_hash: 'Mjc2NzZlMGVmA==',
  phone_number: '0718566741',
  payment_reference: [
	{
	  payment_reference: 'TA677AKMYJ',
	  payment_date: '2025-01-06T13:35:15Z',
	  inserted_at: '2025-01-06T13:35:15',
	  currency: 'KES',
	  amount: '1.00'
	}
  ],
  payment_date: '2025-01-06 16:35:15+03:00 EAT Africa/Nairobi',
  payment_channel: 'MPesa',
  last_payment_amount: '1.00',
  invoice_number: 'GKVLDP',
  invoice_amount: '1.00',
  currency: 'KES',
  client_invoice_ref: 'ORDER-1736170468163',
  amount_paid: '1'
}
	 */

// sendEmail(cart.user.email, 'Order Confirmation - Kenya Law', 'order-confirmation', {
// 	username: cart.user.name || cart.user.email,
// 	order: {
// 		...order,
// 		ProductOnOrder: order.ProductOnOrder.map((item) => ({
// 			...item,
// 			product: cart.CartItem.find((cartItem) => cartItem.productId === item.productId)?.product
// 		}))
// 	},
// 	origin: url.origin
// });
