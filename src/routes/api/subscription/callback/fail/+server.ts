import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Extract payment reference from URL parameters
		const billRefNumber = url.searchParams.get('billRefNumber');
		const errorMessage = url.searchParams.get('message') || 'Payment failed';

		if (billRefNumber) {
			// Find and mark the subscription as failed
			const subscription = await prisma.userSubscription.findFirst({
				where: {
					createdAt: {
						// Look for subscriptions created in the last hour that match the pattern
						gte: new Date(Date.now() - 60 * 60 * 1000)
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			});

			if (subscription) {
				// Mark subscription as cancelled and inactive
				await prisma.userSubscription.update({
					where: { id: subscription.id },
					data: {
						isActive: false,
						status: 'CANCELLED'
					}
				});

				// Create failed payment record
				await prisma.payment.create({
					data: {
						userId: subscription.userId,
						amount: 0,
						status: 'FAILED',
						provider: 'PESAFLOW',
						providerRef: billRefNumber,
						subscriptionId: subscription.id
					}
				});
			}
		}

		return redirect(302, `/profile?subscription=failed&message=${encodeURIComponent(errorMessage)}`);
	} catch (error) {
		console.error('Subscription failure callback error:', error);
		return redirect(302, '/profile?subscription=error&message=Failed to process payment failure');
	}
};
