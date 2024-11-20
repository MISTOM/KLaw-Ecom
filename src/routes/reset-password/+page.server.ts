import { RESET_KEY } from '$env/static/private';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import prisma from '$lib/server/prisma';
import type { Actions, PageServerLoad } from './$types';
import auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const load = (async ({ url: { searchParams } }) => {
	const token = searchParams.get('token');

	if (!token) return { status: 400, error: 'Token is required' };

	try {
		const decoded = jwt.verify(token, RESET_KEY) as JwtPayload;
		const user = await prisma.user.findUnique({
			where: { id: decoded.id }
		});
		if (!user) return { status: 400, error: 'Invalid token' };

		return { status: 200, token };
	} catch (e) {
		//@ts-ignore
		if (e?.message === 'jwt expired') return { status: 400, error: 'Token expired' };

		console.error('Error verifying token:', e);
		return { status: 500, error: 'Something went wrong' };
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();
		const token = formData.get('token')?.toString();

		if (!password || !confirmPassword || !token) return fail(400, { message: 'All fields are required' });

		if (password !== confirmPassword) return fail(400, { message: 'Passwords do not match' });

		let success;
		try {
			const decoded = jwt.verify(token, RESET_KEY) as JwtPayload;
			const user = await prisma.user.findUnique({
				where: { id: decoded.id }
			});
			if (!user) return fail(400, { message: 'Invalid token' });

			const hashedPassword = await auth.hash(password);
			await prisma.user.update({
				where: { id: user.id },
				data: { password: hashedPassword }
			});

			success = true;
		} catch (error) {
			console.error('Error with token:', error);
			return fail(500, { message: 'Something went wrong' });
		}

		if (success) return redirect(303, '/login');
	}
};
