import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.id) {
		throw error(401, 'Unauthorized');
	}

	const subscription = await prisma.userSubscription.findFirst({
		where: {
			userId: locals.user.id
		},
		include: {
			plan: true
		}
	});

	const serializedSubscription = subscription
		? {
				...subscription,
				plan: {
					...subscription.plan,
					price: Number(subscription.plan.price)
				}
			}
		: null;

	return {
		subscription: serializedSubscription
	};
};

export const actions: Actions = {
	cancelSubscription: async ({ locals }) => {
		if (!locals.user?.id) {
			throw error(401, 'Unauthorized');
		}

		try {
			await prisma.userSubscription.updateMany({
				where: {
					userId: locals.user.id,
					status: 'ACTIVE'
				},
				data: {
					status: 'CANCELLED'
				}
			});
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { success: false, message: 'Failed to cancel subscription' });
		}
	}
};
