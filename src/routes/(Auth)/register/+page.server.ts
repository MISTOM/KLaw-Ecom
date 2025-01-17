import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';
import { validateAndFormatPhoneNumber } from '$lib/server/utils';
import { sendEmail } from '$lib/server/mailService';
// import { RECAPTCHA_SECRET_KEY } from '$env/static/private'; // TODO
import { validateRegistration } from '$lib/validations/index';

export const load = (async ({ locals }) => {
	// if (locals.user) { throw redirect(303, '/') }
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, url, fetch }) => {
		// const formData = await request.formData();
		// console.log(formData);
		// const name = formData.get('name');
		// const email = formData.get('email');
		// const phoneNumber = formData.get('phoneNumber');
		// const idNumber = formData.get('idNumber');
		// const password = formData.get('password');
		// const confirmPassword = formData.get('confirmPassword');
		// const recaptchaToken = formData.get('g-recaptcha-response');

		const formData = Object.fromEntries(await request.formData());
		const validation = validateRegistration(formData);

		if (!validation.success) {
			return fail(400, {
				data: formData,
				errors: validation.errors
			});
		}
		const { name, email, phoneNumber, idNumber, password } = validation.data!; // or = validation.data ?? {}

		// if (!recaptchaToken) {
		// 	return fail(400, {
		// 		data: { name, email, phoneNumber, idNumber },
		// 		errors: 'Missing reCAPTCHA token'
		// 	});
		// }

		try {
			// const secret = RECAPTCHA_SECRET_KEY;
			// if (!secret) {
			// 	console.error('No reCAPTCHA secret found in environment variables.');
			// 	return fail(500, { data: { name, email, phoneNumber, idNumber }, errors: 'Server configuration error.' });
			// }

			// // Verify token with Google
			// const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
			// const response = await fetch(verificationURL, {
			// 	method: 'POST',
			// 	body: new URLSearchParams({
			// 		secret,
			// 		response: recaptchaToken.toString()
			// 	})
			// });
			// const verificationData = await response.json();
			// console.log('reCAPTCHA verification data: \n ', verificationData);

			// if (!verificationData.success) {
			// 	return fail(400, {
			// 		data: { name, email, phoneNumber, idNumber },
			// 		errors: 'reCAPTCHA verification failed.'
			// 	});
			// }

			const user = await prisma.user.findUnique({
				where: { email: email.toString() }
			});
			if (user) {
				return fail(400, {
					data: { name, email, phoneNumber, idNumber },
					errors: { email: ['Email is already in use. Please log in.'] }
				});
			}
			const hashedPassword = await auth.hash(password.toString());
			const newUser = await prisma.user.create({
				data: {
					name: name.toString(),
					email: email.toString(),
					idNumber: parseInt(idNumber.toString()),
					phoneNumber: phoneNumber.toString(),
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
				data: { name, email, password, phoneNumber, idNumber },
				errors: { _errors: ['An unexpected error occurred'] }
			});
		}
	}
};
