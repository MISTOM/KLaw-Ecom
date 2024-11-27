import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const load = (async ({ params }) => {
	const id = Number(params.id);

	try {
		const category = await prisma.category.findUnique({
			where: { id }
		});

		return { category };
	} catch (e) {
		console.error(e);
	}
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, params }) => {
		const formData = Object.fromEntries(await request.formData());

		const { name } = formData;
		if (!name) return fail(400, { errors: 'Please enter a category name' });

		const id = Number(params.id);
		if (isNaN(id)) return fail(400, { errors: 'Invalid category id' });

		try {
			const category = await prisma.category.update({
				where: { id },
				data: { name: name.toString() }
			});
			return { category };
		} catch (e) {
			console.error(e);
			return fail(400, { errors: 'Error updating category' });
		}
	}
};
