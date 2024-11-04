import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../login/$types';

export const load = (async ({ locals: { user }, url }) => {
	if (!url.pathname.startsWith('/product') && !user) throw redirect(303, '/login');
}) satisfies PageServerLoad;
