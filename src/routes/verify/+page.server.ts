import { SECRET_KEY } from '$env/static/private';
import type { PageServerLoad } from './$types';
import jwt from 'jsonwebtoken';
import prisma from '$lib/server/prisma';

export const load = (async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) return { status: 400, error: 'Token is required' };

	try {
		const decoded = jwt.verify(token, SECRET_KEY);
		//@ts-ignore
		const { email } = decoded;
		const user = await prisma.user.findUnique({
			where: { email }
		});
		if (!user) return { status: 400, error: 'Invalid token' };
		if (user.isVerified) return { status: 400, error: 'Email already verified' };

		await prisma.user.update({
			where: { email },
			data: { isVerified: true }
		});
		return { status: 200, message: 'Email verified' };
	} catch (e) {
		//@ts-ignore
		console.log(e.message);
		//@ts-ignore
		if (e.message === 'jwt expired') return { status: 400, error: 'Token expired' };
		//@ts-ignore
		if (e.message === 'invalid signature' || e.message === 'jwt malformed')
			return { status: 400, error: 'Invalid token' };
		return { status: 500, error: 'Error validating Token' };
	}
}) satisfies PageServerLoad;
