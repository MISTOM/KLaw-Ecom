import prisma from '$lib/server/prisma.js';
import auth from '$lib/server/auth.js';
import { type Actions, error, fail } from '@sveltejs/kit';
import { goto } from '$app/navigation';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		console.log(formData);
		const email = formData.get('email');
		const password = formData.get('password');

		if (!email || !password) {
			return {
				data: { email },
				errors: 'Username and password required'
			};
		}

		let user;
		try {
			user = await prisma.user.findUnique({
				where: { email: email.toString() }
			});
			if (!user) {
				return {
					data: { email },
					errors: 'Invalid emmail or password'
				};
			}
		} catch (e) {
			console.log(e);
			return {
				data: email,
				errors: e
			};
		}

		const isvalidPassword = await auth.compare(password, user.password);
		if (!isvalidPassword) {
			return {
				data: { email },
				errors: 'Invalid email or passsword'
			};
		}
		const token = auth.sign(user);
		const refreshToken = await auth.generateRefreshToken(user);
		console.log(token, refreshToken);
	}
} satisfies Actions;
