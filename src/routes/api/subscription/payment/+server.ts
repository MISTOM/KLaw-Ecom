import { API_CLIENT_ID, KEY, SECRET, SERVICE_ID } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';
import { createHmac } from 'node:crypto';

export const POST: RequestHandler = async ({ locals: { user }, request, url: { origin } }) => {
	if (!user) return error(401, 'Unauthorized: No user logged in');

	try {
		const { planId, planPrice, planName } = await request.json();

		if (!planId || !planPrice || !planName) {
			return error(400, 'Missing required subscription details');
		}

		// Verify the plan exists
		const plan = await prisma.subscriptionPlan.findUnique({
			where: { id: planId }
		});

		if (!plan) {
			return error(404, 'Subscription plan not found');
		}

		// Check if user already has an active subscription
		const existingSubscription = await prisma.userSubscription.findFirst({
			where: {
				userId: user.id,
				status: 'ACTIVE',
				isActive: true,
				endsAt: {
					gte: new Date()
				}
			}
		});

		if (existingSubscription) {
			return error(400, 'You already have an active subscription');
		}

		// Get user details from database for payment
		const userDetails = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				name: true,
				email: true,
				phoneNumber: true,
				idNumber: true
			}
		});

		if (!userDetails) {
			return error(404, 'User not found');
		}

		// Generate unique reference for this subscription payment including plan ID | TODO: Encrypt this
        /**
         * const hash = createHmac('sha256', KEY)
+ 			.update(`${user.id}-${planId}-${Date.now()}`)
+ 			.digest('hex')
+ 			.slice(0, 16); // Shorten for readability
+ 		const billRefNumber = `SUB-${hash}`;
         */
		const billRefNumber = `SUB-${Date.now()}-${user.id}-${planId}`;

		// Create payment details for PesaFlow - using same env vars as checkout
		if (!API_CLIENT_ID || !SECRET || !SERVICE_ID || !KEY) {
			return error(500, 'Payment configuration missing');
		}

		// Calculate convenience fee
		const convenienceFee = 0;
		const totalAmount = Number(plan.price) + convenienceFee;

		// Prepare payment details (same structure as checkout)
		const paymentDetails = {
			apiClientID: API_CLIENT_ID,
			amountExpected: totalAmount,
			serviceID: SERVICE_ID,
			clientIDNumber: userDetails.idNumber || '0',
			currency: 'KES',
			billRefNumber,
			billDesc: `Subscription: ${planName}`,
			clientName: userDetails.name || userDetails.email,
			secret: SECRET
		};

		// Data string for secure hash (same format as checkout)
		const dataString = [
			paymentDetails.apiClientID,
			paymentDetails.amountExpected,
			paymentDetails.serviceID,
			paymentDetails.clientIDNumber,
			paymentDetails.currency,
			paymentDetails.billRefNumber,
			paymentDetails.billDesc,
			paymentDetails.clientName,
			paymentDetails.secret
		].join('');

		// Generate secure hash using same method as checkout
		const secureHash = generateSecureHash(dataString, KEY);

		// NOTE: We don't create the subscription here anymore!
		// Subscription will only be created when payment is confirmed via webhook
		// This prevents database pollution from abandoned payments

		return json({
			paymentDetails: {
				...paymentDetails,
				secureHash,
				callBackURLOnSuccess: `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/api/subscription/callback/success`,
				callBackURLOnFail: `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/api/subscription/callback/fail`,
				notificationURL: `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/api/subscription/notification`,
				clientEmail: userDetails.email,
				clientMSISDN: userDetails.phoneNumber || '0700000000',
				pictureURL: `${process.env.PUBLIC_BASE_URL || 'http://localhost:5173'}/kLawLogo.png`
			},
			convenienceFee,
			planDetails: {
				id: plan.id,
				name: plan.name,
				price: plan.price,
				duration: plan.duration
			}
		});
	} catch (err) {
		console.error('Subscription payment initiation error:', err);
		return error(500, 'Failed to initiate subscription payment');
	}
};

/**
 * Generate a secure hash using HMAC with SHA256
 * @param dataString String to hash
 * @param secretKey Secret key to use for hashing
 * @returns Base64 encoded hash
 */
function generateSecureHash(dataString: string, secretKey: string): string {
	// Create HMAC with SHA256
	const hmac = createHmac('sha256', secretKey);

	// Update with data and generate hash
	hmac.update(dataString);

	// Generate base64 encoded hash
	return hmac.digest('base64');
}
