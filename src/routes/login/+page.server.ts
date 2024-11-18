import prisma from '$lib/server/prisma.js';
import auth from '$lib/server/auth.js';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invalidateAll } from '$app/navigation';
import { maxAge, refreshTokenMaxAge } from '$lib/server/utils';
import { NODE_ENV } from '$env/static/private';

export const load = (async ({ locals: { user } }) => {}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		console.log(formData);
		const email = formData.get('email');
		const password = formData.get('password');

		if (!email || !password) {
			return fail(400, {
				data: { email },
				errors: 'Username and password required'
			});
		}

		let user;
		try {
			user = await prisma.user.findUnique({
				where: { email: email.toString() }
			});
			if (!user) {
				return fail(400, {
					data: { email },
					errors: 'Invalid emmail or password'
				});
			}
		} catch (e) {
			console.log(e);
			return fail(500, {
				data: { email },
				errors: 'Internal Server Error'
			});
		}

		const isvalidPassword = await auth.compare(password.toString(), user.password);
		if (!isvalidPassword) {
			return fail(401, {
				data: { email },
				errors: 'Invalid email or passsword'
			});
		}
		const token = auth.sign(user);
		const refreshToken = await auth.generateRefreshToken(user);

		//TODO - set secure to true in production
		cookies.set('token', token, { httpOnly: true, secure: NODE_ENV === 'production', path: '/', maxAge });
		cookies.set('refreshToken', refreshToken, {
			httpOnly: true,
			secure: NODE_ENV === 'production',
			path: '/',
			maxAge: refreshTokenMaxAge
		});

		(await auth.isAdmin(user)) ? redirect(303, '/admin/product') : redirect(303, '/product');
	}
} satisfies Actions;
