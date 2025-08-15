import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

// export const GET: RequestHandler = async ({ url }) => {
// 	try {
// 		// Extract payment reference from URL parameters
// 		const billRefNumber = url.searchParams.get('billRefNumber');

// 		if (!billRefNumber) {
// 			return redirect(302, '/profile?subscription=error&message=Missing payment reference');
// 		}

// 		// Find the subscription by payment reference pattern
// 		const subscription = await prisma.userSubscription.findFirst({
// 			where: {
// 				createdAt: {
// 					// Look for subscriptions created in the last hour that match the pattern
// 					gte: new Date(Date.now() - 60 * 60 * 1000)
// 				}
// 			},
// 			orderBy: {
// 				createdAt: 'desc'
// 			}
// 		});

// 		if (subscription) {
// 			// Activate the subscription
// 			await prisma.userSubscription.update({
// 				where: { id: subscription.id },
// 				data: {
// 					isActive: true,
// 					status: 'ACTIVE'
// 				}
// 			});

// 			// Create payment record
// 			await prisma.payment.create({
// 				data: {
// 					userId: subscription.userId,
// 					amount: 0, // You might want to store the actual amount
// 					status: 'SUCCEEDED',
// 					provider: 'PESAFLOW',
// 					providerRef: billRefNumber,
// 					subscriptionId: subscription.id
// 				}
// 			});
// 		}

// 		return redirect(302, '/profile?subscription=success');
// 	} catch (error) {
// 		console.error('Subscription success callback error:', error);
// 		return redirect(302, '/profile?subscription=error&message=Failed to process payment');
// 	}
// };
