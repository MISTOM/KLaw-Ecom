import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
	try {
		// Retrieve the first (and only) convenience fee record, or null if none
		const convenienceFee = await prisma.convenienceFee.findFirst();
		return { convenienceFee };
	} catch (e) {
		console.error(e);
		return { convenienceFee: null };
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	add_fee: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const { amount } = formData;

		if (!amount) {
			return fail(400, { errors: 'Please enter a fee amount.' });
		}

		try {
			// Check if there's already a convenience fee
			const feeExists = await prisma.convenienceFee.findFirst();
			if (feeExists) return fail(400, { errors: 'A convenience fee is already set.' });

			// Create the new fee
			const createdFee = await prisma.convenienceFee.create({
				data: {
					amount: parseFloat(amount.toString())
				}
			});

			return { convenienceFee: createdFee };
		} catch (e) {
			console.error(e);
			return fail(400, { errors: 'Error creating convenience fee.' });
		}
	},

	update_fee: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const { id, amount } = formData;

		if (!amount) return fail(400, { errors: 'Please enter a fee amount' });

		const feeId = Number(id);
		if (isNaN(feeId)) return fail(400, { errors: 'Invalid convenience fee ID.' });

		try {
			const updatedFee = await prisma.convenienceFee.update({
				where: { id: feeId },
				data: {
					amount: parseFloat(amount.toString())
				}
			});

			return { convenienceFee: updatedFee };
		} catch (e) {
			console.error(e);
			return fail(400, { errors: 'Error updating convenience fee.' });
		}
	},

	delete_fee: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const { id } = formData;

		if (!id) {
			return fail(400, { errors: 'Invalid convenience fee ID.' });
		}

		const feeId = Number(id);
		if (isNaN(feeId)) {
			return fail(400, { errors: 'Invalid convenience fee ID.' });
		}

		try {
			await prisma.convenienceFee.delete({
				where: { id: feeId }
			});
			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(400, { errors: 'Error deleting convenience fee.' });
		}
	}
};
