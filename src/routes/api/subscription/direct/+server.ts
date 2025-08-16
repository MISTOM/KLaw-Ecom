import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

/**
 * Development endpoint to directly activate a subscription without payment
 * This bypasses the payment flow for testing purposes
 * TODO: Remove this endpoint before production deployment
 */
export const POST: RequestHandler = async ({ locals: { user }, request }) => {
    if (!user) return error(401, 'Unauthorized: No user logged in');

    try {
        const { planId } = await request.json();

        if (!planId) {
            return error(400, 'Missing plan ID');
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

        // Calculate subscription end date
        const now = new Date();
        const endsAt = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

        // Create the subscription directly without payment
        const subscription = await prisma.userSubscription.create({
            data: {
                userId: user.id,
                planId: plan.id,
                status: 'ACTIVE',
                isActive: true,
                startsAt: now,
                endsAt: endsAt
            }
        });

        return json({
            success: true,
            message: 'Subscription activated successfully (Development Mode)',
            subscription: {
                id: subscription.id,
                planName: plan.name,
                endsAt: subscription.endsAt
            }
        });

    } catch (err: any) {
        console.error('Direct subscription error:', err);
        return error(500, 'Failed to activate subscription');
    }
};
