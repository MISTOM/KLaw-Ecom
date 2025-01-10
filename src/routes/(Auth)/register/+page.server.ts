import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';
import { maxAge, refreshTokenMaxAge, secure } from '$lib/server/utils';
import { sendEmail } from '$lib/server/mailService';

export const load = (async ({ locals }) => {
	// if (locals.user) { throw redirect(303, '/') }
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		console.log(formData);
		const name = formData.get('name');
		const email = formData.get('email');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (!name || !email || !password) {
			return fail(400, {
				data: { name, email },
				errors: 'Please fill in all fields'
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				data: { name, email },
				errors: 'Passwords do not match'
			});
		}

		try {
			const user = await prisma.user.findUnique({
				where: { email: email.toString() }
			});
			if (user) {
				return fail(400, {
					data: { name, email },
					errors: 'Invalid email or password.'
				}); // TODO: Redirect to login page or 'Email already exists'
			}
			const hashedPassword = await auth.hash(password.toString());
			const newUser = await prisma.user.create({
				data: {
					name: name.toString(),
					email: email.toString(),
					password: hashedPassword,
					role: { connect: { name: 'USER' } }
				}
			});

			//Send email verification
			const token = auth.generateEmailVerificationToken(newUser.email);
			const link = url.origin + `/verify?token=${token}`;
			const isEmailSent = await sendEmail(newUser.email, `${newUser.name}, Veriry Your Email`, 'verify-email', {
				username: name,
				origin: url.origin,
				link
			});
			console.log('Email Sent?: ', isEmailSent);

			return { status: 200, body: { message: 'User created successfully', isEmailSent } };

			// Register user and Login immediately
			// const token = auth.sign(newUser);
			// const refreshToken = await auth.generateRefreshToken(newUser);

			// cookies.set('token', token, { httpOnly: true, secure: secure, path: '/', maxAge });
			// cookies.set('refreshToken', refreshToken, {
			// 	httpOnly: true,
			// 	secure: secure,
			// 	path: '/',
			// 	maxAge: refreshTokenMaxAge
			// });

			// console.log(
			// 	'is Email Sent: --\n',
			// 	await sendEmail(newUser.email, `Welcome ${newUser.name}`, 'welcome', { username: name, email })
			// );
		} catch (e) {
			console.log(e);
			return fail(500, {
				data: { name, email, password },
				errors: 'An error occurred'
			});
		}
	}
};
