import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { sendEmail } from '$lib/server/mailService';
import prisma from '$lib/server/prisma';
import auth from '$lib/server/auth';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();

		if (!email) return fail(400, { message: 'Email is required', data: { email } });

		try {
			// check if user exist
			const user = await prisma.user.findUnique({
				where: { email }
			});
			if (!user) return fail(400, { message: 'You do not have an account with us', data: { email } });

			const resetToken = auth.generateResetToken(user.id);

			// create reset password link
			const link = url.origin + `/reset-password?token=${resetToken}`;
			const origin = url.origin;

			// Send email
			const emailSent = await sendEmail(user.email, 'Password Reset', 'password-reset', { link, origin });
			console.log('Email Sent: please check your mailbox ', emailSent);
		} catch (e) {
			console.error('Error with sending email:', e);
			return fail(500, { message: 'Something went wrong', data: { email } });
		}
	}
};
