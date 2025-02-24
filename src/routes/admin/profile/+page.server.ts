import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';
import { sendEmail } from '$lib/server/mailService';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	editProfile: async ({ request, locals: { user } }) => {
		if (!(await auth.isAdmin(user))) return fail(401, { errors: 'Unauthorized' });

		const id = Number(user?.id);
		const formData = Object.fromEntries(await request.formData());
		const { name, email, phoneNumber, idNumber, address, postalCode } = formData;

		if (!name || !email) {
			return fail(400, { errors: 'Required fields are missing' });
		}

		try {
			await prisma.user.update({
				where: { id },
				data: {
					name: name.toString(),
					email: email.toString(),
					phoneNumber: phoneNumber?.toString(),
					idNumber: idNumber ? parseInt(idNumber.toString()) : undefined,
					address: address?.toString(),
					postalCode: postalCode?.toString()
				}
			});

			return { success: true };
		} catch (e) {
			console.error('updateAdminProfile:', e);
			return fail(500, { errors: 'Internal server error updating profile' });
		}
	},

	changePassword: async ({ request, locals: { user }, url }) => {
		if (!(await auth.isAdmin(user))) return fail(401, { errors: 'Unauthorized' });

		const id = Number(user?.id);
		const formData = Object.fromEntries(await request.formData());
		const { oldPassword, password, confirmPassword } = formData;

		if (!oldPassword || !password || !confirmPassword) {
			return fail(400, { errors: 'All password fields are required' });
		}

		if (password !== confirmPassword) {
			return fail(400, { errors: 'Passwords do not match' });
		}

		try {
			const existingUser = await prisma.user.findUnique({ where: { id } });
			if (!existingUser) return fail(400, { errors: 'User not found' });

			const match = await auth.compare(oldPassword.toString(), existingUser.password);
			if (!match) return fail(400, { errors: 'Old password is incorrect' });

			const newPassword = await auth.hash(password.toString());

			const { id: userId } = await prisma.user.update({
				where: { id },
				data: { password: newPassword }
			});

			const resetToken = auth.generateResetToken(userId);
			const link = url.origin + `/reset-password?token=${resetToken}`;
			const origin = url.origin;

			await sendEmail(existingUser.email, 'Password Change Notification', 'notify-password-change', {
				link,
				origin
			});

			return { success: true };
		} catch (e) {
			console.error('changeAdminPassword:', e);
			return fail(500, { errors: 'Internal server error changing password' });
		}
	}
};
