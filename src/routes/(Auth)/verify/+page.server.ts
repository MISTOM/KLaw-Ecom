import { SECRET_KEY } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';
import jwt from 'jsonwebtoken';
import prisma from '$lib/server/prisma';
import auth from '$lib/server/auth';
import { sendEmail } from '$lib/server/mailService';
import { fail } from '@sveltejs/kit';

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

export const actions: Actions = {
	default: async ({ request, url }) => {
		const { email } = Object.fromEntries((await request.formData()).entries());
		if (!email) return fail(400, { data: { email }, error: 'Email is required' });

		const _email = email.toString().trim().toLowerCase();

		try {
			const user = await prisma.user.findUnique({
				where: { email: _email }
			});
			if (!user) return fail(404, { data: { email }, error: 'Account not found, please Register' });
			if (user.isVerified) return fail(400, { data: { email }, error: 'Email already verified' });

			const token = auth.generateEmailVerificationToken(user.email);
			const link = url.origin + `/verify?token=${token}`;
			const isEmailSent = await sendEmail(user.email, `${user.name}, Veriry Your Email`, 'verify-email', {
				username: user.name,
				origin: url.origin,
				link
			});
			console.log('Email Sent?: ', isEmailSent);
			return { status: 200, message: 'Email verification sent' };
		} catch (e) {
			console.log(e);
			return fail(500, { data: { email }, error: 'An error occurred' });
		}
	}
};
