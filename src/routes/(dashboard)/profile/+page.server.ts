import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import auth from '$lib/server/auth';
import { sendEmail } from '$lib/server/mailService';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, locals: { user }, url }) => {
		// if (!user) redirect(303, '/login');

		const id = Number(user?.id);
		const formData = Object.fromEntries(await request.formData());
		const { name, email, phoneNumber, oldPassword, password, confirmPassword } = formData;

		if (!name || !email) {
			return fail(400, { data: formData, errors: 'All fields are required' });
		}

		try {
			let newPassword;

			if (oldPassword) {
				if (!password || !confirmPassword)
					return fail(400, { data: formData, errors: 'All password fields are required' });

				if (password !== confirmPassword) return fail(400, { data: formData, errors: 'Passwords do not match' });

				const existingUser = await prisma.user.findUnique({ where: { id } });
				if (!existingUser) return fail(400, { errors: 'User not found' });

				const match = await auth.compare(oldPassword.toString(), existingUser.password);
				if (!match) return fail(400, { data: formData, errors: 'Old password is incorrect' });

				newPassword = await auth.hash(password.toString());
			}

			const { id: userId } = await prisma.user.update({
				where: { id },
				data: {
					name: name.toString(),
					email: email.toString(),
					phoneNumber: phoneNumber?.toString(),
					...(newPassword && { password: newPassword })
				}
			});

			//if password was updated, send an email
			if (newPassword) {
				const resetToken = auth.generateResetToken(userId);
				const link = url.origin + `/reset-password?token=${resetToken}`;
				const origin = url.origin;

				const emailSent = await sendEmail(email, 'Password Change Notification', 'notify-password-change', {
					link,
					origin
				});
				console.log(emailSent);
			}

			return { success: true };
		} catch (e) {
			console.error('updateProfile:', e);
			return fail(500, { errors: 'Internal server error updating profile' });
		}
	}
};
