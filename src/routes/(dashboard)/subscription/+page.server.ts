import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const plans = await prisma.subscriptionPlan.findMany({
		where: { isActive: true },
		orderBy: { price: 'asc' }
	});
	const serializedPlans = plans.map((plan) => ({
		...plan,
		price: Number(plan.price)
	}));

	return {
		plans: serializedPlans
	};
};
