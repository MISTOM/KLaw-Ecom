import type { LayoutServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals: { user }, url: {pathname} }) => {
	if(pathname === '/') redirect(303, '/product')
	if (user) {
		console.log('user found:', user);
		const loggedInUser = await prisma.user.findUnique({
			where: { id: user.id }
		});
		return { user: loggedInUser };
	}
	return { user: null };
}) satisfies LayoutServerLoad;
