import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json();
	console.log('Notification payload:', payload);

	try {
		// Handle payment success
		if (payload.status === 'settled' && payload.client_invoice_ref) {
			// Start transaction
			const result = await prisma.$transaction(async (tx) => {
				// Find cart using billRefNumber from payment payload
				const cart = await tx.cart.findFirst({
					where: {
						user: {
							Order: {
								none: { billRefNumber: payload.client_invoice_ref }
							}
						}
					},
					include: {
						CartItem: {
							include: { product: true }
						},
						user: true
					}
				});

				if (!cart) {
					throw new Error('Cart not found or order already exists');
				}

				// Calculate total price
				const totalPrice = cart.CartItem.reduce(
					(sum, item) => sum + item.product.price * item.quantity,
					0
				);

				// Create order
				const order = await tx.order.create({
					data: {
						userId: cart.userId,
						totalPrice,
						status: 'COMPLETED',
						billRefNumber: payload.client_invoice_ref,
						invoiceNumber: payload.invoice_number,
						ProductOnOrder: {
							createMany: {
								data: cart.CartItem.map(item => ({
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

				// Update product quantities
				for (const item of cart.CartItem) {
					await tx.product.update({
						where: { id: item.productId },
						data: { quantity: { decrement: item.quantity } }
					});
				}

				// Clear user's cart
				await tx.cart.delete({
					where: { id: cart.id }
				});

				return order;
			});
			console.log('Order created:', result);

			return json({
				message: 'Order created successfully',
				order: result
			});
		} else {
			console.log('Payment not settled...', payload);
		}

		return json({ message: 'Notification received' });
	} catch (error) {
		console.error('Webhook error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

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
