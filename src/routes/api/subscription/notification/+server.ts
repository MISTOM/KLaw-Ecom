import { json, error } from '@sveltejs/kit';
import { PaymentValidator } from '$lib/server/services/PaymentValidator';
import { rateLimiter } from '$lib/server/services/RateLimiter';
import prisma from '$lib/server/prisma';
import { sendEmail } from '$lib/server/mailService';

export const POST = async ({ request, url }) => {
	console.log('Subscription notification received:', request.headers);
	// TODO: Implement rate limiting and validation
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
		console.log('Subscription payment payload:', payload);

		// Validate payload structure
		const validatedPayload = PaymentValidator.validateCallback(payload);

		// Verify signature
		// if (!PaymentValidator.verifySignature(payload, signature)) {
		// 	throw error(400, 'Invalid signature');
		// }

		if (validatedPayload?.status === 'settled') {
			return await processSubscriptionPayment(validatedPayload, url);
		}

		return json({ message: 'Subscription notification acknowledged' });
	} catch (e: any) {
		console.error('Subscription payment webhook error:', e);
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

async function processSubscriptionPayment(payload: any, url: URL) {
	return await prisma.$transaction(
		async (tx) => {
			// Find the pending subscription by payment reference pattern
			// The client_invoice_ref should start with 'SUB-' for subscriptions
			if (!payload.client_invoice_ref?.startsWith('SUB-')) {
				throw error(400, 'Invalid subscription payment reference');
			}

			// Extract user ID and plan ID from the reference (SUB-timestamp-userId-planId)
			const refParts = payload.client_invoice_ref.split('-');
			const userId = refParts.length >= 3 ? parseInt(refParts[2]) : null;
			const planId = refParts.length >= 4 ? parseInt(refParts[3]) : null;

			if (!userId || !planId) {
				throw error(400, 'Invalid subscription reference format - missing user or plan ID');
			}

			// Get user and plan details
			const user = await tx.user.findUnique({
				where: { id: userId }
			});

			const plan = await tx.subscriptionPlan.findUnique({
				where: { id: planId }
			});

			if (!user || !plan) {
				throw error(404, 'User or subscription plan not found');
			}

			// Check if user already has an active subscription (prevent duplicates)
			const existingSubscription = await tx.userSubscription.findFirst({
				where: {
					userId: userId,
					isActive: true,
					status: 'ACTIVE',
					endsAt: {
						gte: new Date()
					}
				}
			});

			if (existingSubscription) {
				console.warn(`User ${userId} already has active subscription, skipping creation`);
				throw error(400, 'User already has an active subscription');
			}
			// Validate payment amount matches plan price + convenience fee
			const planPrice = Number(plan.price);
			const convenienceFee = 0;
			const expectedAmount = planPrice + convenienceFee;
			const paidAmount = parseFloat(payload.amount_paid || '0');

			if (Math.abs(paidAmount - expectedAmount) > 1) {
				// Allow 1 KES difference for rounding
				console.warn(`Payment amount mismatch: expected ${expectedAmount}, got ${paidAmount}`);
			}

			// Create the subscription (not just activate - this is the actual creation)
			const subscription = await tx.userSubscription.create({
				data: {
					userId: userId,
					planId: planId,
					status: 'ACTIVE',
					isActive: true, // Immediately active since payment is confirmed
					startsAt: new Date(),
					endsAt: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
				},
				include: {
					plan: true
				}
			});

			// Create payment record
			const payment = await tx.payment.create({
				data: {
					userId: subscription.userId,
					subscriptionId: subscription.id,
					amount: paidAmount,
					status: 'SUCCEEDED',
					provider: 'PESAFLOW',
					providerRef: payload.payment_reference?.[0]?.payment_reference || payload.client_invoice_ref,
					currency: payload.currency || 'KES',
					rawPayload: payload
				}
			});

			// Send confirmation email to user
			sendEmail(user.email, 'Subscription Activated - Kenya Law', 'subscription-confirmation', {
				username: user.name || user.email,
				subscription: {
					...subscription,
					plan: plan
				},
				payment: {
					amount: paidAmount,
					reference: payload.client_invoice_ref,
					paymentDate: payload.payment_date,
					paymentChannel: payload.payment_channel
				},
				origin: url.origin
			}).catch((error) => console.error('Failed to send subscription confirmation email:', error));

			// Send email to admin
			sendEmail(
				'thomas.kigarde@bsl.co.ke',
				'New Subscription Activated - Kenya Law',
				'new-subscription-notification',
				{
					subscription: {
						...subscription,
						user: user,
						plan: plan
					},
					payment: {
						amount: paidAmount,
						reference: payload.client_invoice_ref,
						paymentDate: payload.payment_date,
						paymentChannel: payload.payment_channel
					},
					origin: url.origin
				}
			).catch((error) => console.error('Failed to send admin subscription notification email:', error));

			return json({
				success: true,
				subscription: subscription,
				payment: payment
			});
		},
		{
			timeout: 10000,
			isolationLevel: 'Serializable'
		}
	);
}

/**
 * Sample data from the subscription notification url
 * Same structure as order notifications:
 * {
 *   status: 'settled',
 *   secure_hash: 'Mjc2NzZlMGVmA==',
 *   phone_number: '0718566741',
 *   payment_reference: [
 *     {
 *       payment_reference: 'TA677AKMYJ',
 *       payment_date: '2025-01-06T13:35:15Z',
 *       inserted_at: '2025-01-06T13:35:15',
 *       currency: 'KES',
 *       amount: '1000.00'
 *     }
 *   ],
 *   payment_date: '2025-01-06 16:35:15+03:00 EAT Africa/Nairobi',
 *   payment_channel: 'MPesa',
 *   last_payment_amount: '1000.00',
 *   invoice_number: 'GKVLDP',
 *   invoice_amount: '1000.00',
 *   currency: 'KES',
 *   client_invoice_ref: 'SUB-1736170468163-123',
 *   amount_paid: '1000'
 * }
 */
