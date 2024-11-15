import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load = (async () => {
	try {
		const users = await prisma.user.findMany({
			include: { role: true }
		});
		return { users };
	} catch (error) {
		console.log('Error getting users', error);
	}
	return {};
}) satisfies PageServerLoad;
