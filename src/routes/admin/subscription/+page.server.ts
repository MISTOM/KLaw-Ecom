import prisma from '$lib/server/prisma';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const plans = await prisma.subscriptionPlan.findMany({
		orderBy: { createdAt: 'desc' }
	});

	// Reason: Convert Prisma Decimal fields to numbers for JSON serialization
	const serializedPlans = plans.map((plan) => ({
		...plan,
		price: Number(plan.price)
	}));

	return {
		plans: serializedPlans
	};
};

export const actions: Actions = {
	savePlan: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const price = formData.get('price')?.toString();
		const duration = formData.get('duration')?.toString();
		const isActive = formData.get('isActive')?.toString() === 'true';

		if (!name || !price || !duration) {
			return fail(400, { success: false, message: 'Missing required fields' });
		}

		const data = {
			name,
			description,
			price: parseFloat(price),
			duration: parseInt(duration, 10),
			isActive
		};

		try {
			if (id) {
				await prisma.subscriptionPlan.update({
					where: { id: parseInt(id, 10) },
					data
				});
			} else {
				await prisma.subscriptionPlan.create({ data });
			}
			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { success: false, message: 'Failed to save plan' });
		}
	},
	deletePlan: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { success: false, message: 'Missing plan ID' });
		}

		try {
			await prisma.subscriptionPlan.delete({
				where: { id: parseInt(id, 10) }
			});
			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { success: false, message: 'Failed to delete plan' });
		}
	}
};
