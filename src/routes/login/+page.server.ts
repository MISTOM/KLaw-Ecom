import prisma from '$lib/server/prisma.js';
import auth from '$lib/server/auth.js';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types'

export const load = (async ({ locals }) => {
	console.log('this user is here', locals);
	if (locals.user) {
		return redirect(301, '/admin/product');
	}
}) satisfies PageServerLoad

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

		//TODO - Set this globally
		const maxAge = 60 * 60 * 24 * 7; // 1 week
		cookies.set('token', token, { httpOnly: true, secure: true, path: '/', maxAge });
		cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: true, path: '/', maxAge });

		redirect(301, '/admin/product')
	}
} satisfies Actions;
