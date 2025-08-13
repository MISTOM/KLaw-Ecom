import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user as { id: number; email?: string; name?: string } | null;
	if (!user) {
		return { status: 302, redirect: '/login' } as any;
	}
	const id = Number(params.id);
	const doc = await prisma.document.findUnique({ where: { id } });
	// Watermark based on user identity (email preferred)
	const watermark = user?.email || user?.name || `user-${user?.id}`;
	return { pageCount: doc?.pageCount, watermark, docId: id };
};
