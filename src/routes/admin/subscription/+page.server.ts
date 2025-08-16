import prisma from '$lib/server/prisma';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { subscriptionPlanSchema, type FormErrors } from '$lib/validations/validationSchemas';
import { ZodError } from 'zod';

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

		// Extract form data
		const rawData = {
			name: formData.get('name')?.toString() || '',
			description: formData.get('description')?.toString() || null,
			price: parseFloat(formData.get('price')?.toString() || '0'),
			duration: parseInt(formData.get('duration')?.toString() || '0', 10),
			isActive: formData.get('isActive') === 'true'
		};

		try {
			// Validate the data using Zod schema
			const validatedData = subscriptionPlanSchema.parse(rawData);

			if (id) {
				await prisma.subscriptionPlan.update({
					where: { id: parseInt(id, 10) },
					data: validatedData
				});
			} else {
				await prisma.subscriptionPlan.create({ data: validatedData });
			}

			return {
				success: true,
				message: id ? 'Plan updated successfully' : 'Plan created successfully'
			};
		} catch (error) {
			if (error instanceof ZodError) {
				// Return validation errors
				const errors: FormErrors<typeof rawData> = {};
				error.errors.forEach((err) => {
					const path = err.path[0] as keyof typeof rawData;
					if (!errors[path]) errors[path] = [];
					errors[path]!.push(err.message);
				});
				return fail(400, { success: false, errors, data: rawData });
			}

			console.error('Database error:', error);
			return fail(500, {
				success: false,
				message: 'Failed to save plan. Please try again.',
				data: rawData
			});
		}
	},
	deletePlan: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { success: false, message: 'Missing plan ID' });
		}

		try {
			// Check if plan has active subscriptions
			const activeSubscriptions = await prisma.userSubscription.count({
				where: {
					planId: parseInt(id, 10),
					status: 'ACTIVE'
				}
			});

			if (activeSubscriptions > 0) {
				return fail(400, {
					success: false,
					message: 'Cannot delete plan with active subscriptions. Deactivate it instead.'
				});
			}

			await prisma.subscriptionPlan.delete({
				where: { id: parseInt(id, 10) }
			});

			return { success: true, message: 'Plan deleted successfully' };
		} catch (error) {
			console.error('Delete error:', error);
			return fail(500, { success: false, message: 'Failed to delete plan' });
		}
	}
};
