import prisma from '$lib/server/prisma.js';
import auth from '$lib/server/auth.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { maxAge, refreshTokenMaxAge, secure } from '$lib/server/utils';
import { validateLogin } from '$lib/validations';

// export const load = (async ({ locals: { user } }) => {}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const validation = validateLogin(formData);

		if (!validation.success) {
			return fail(400, {
				data: formData,
				errors: validation.errors
			});
		}
		const { email, password } = validation.data!; // or = validation.data ?? {}

		let user;
		try {
			user = await prisma.user.findUnique({
				where: { email: email }
			});
			if (!user) return fail(400, { data: { email }, errors: { _errors: ['Invalid Email or Password'] } });
		} catch (e) {
			console.log(e);
			return fail(500, {
				data: { email },
				errors: { _errors: ['An unexpected error occurred. Please try again later'] }
			});
		}

		const isvalidPassword = await auth.compare(password.toString(), user.password);
		if (!isvalidPassword)
			return fail(401, { data: { email }, errors: { _errors: ['Invalid Email or Password'] } });

		const isAdmin = await auth.isAdmin(user);

		// Check if user is verified
		if (!isAdmin && !user.isVerified) {
			return fail(401, {
				data: { email },
				errors: { _errors: ['Account not verified. Please check your email for verification link'] }
			});
		}

		const token = auth.sign(user);
		const refreshToken = await auth.generateRefreshToken(user);

		//TODO - set secure to true in production
		cookies.set('token', token, { httpOnly: true, secure: secure, path: '/', maxAge });
		cookies.set('refreshToken', refreshToken, {
			httpOnly: true,
			secure: secure,
			path: '/',
			maxAge: refreshTokenMaxAge
		});

		isAdmin ? redirect(303, '/admin/product') : redirect(303, '/product');
	}
};
