import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, locals: { user } }) => {
		if (!(await auth.isAdmin(user))) return fail(401, { errors: 'Unauthorized' });

		const id = Number(user?.id);
		const formData = Object.fromEntries(await request.formData());
		const { name, email, oldPassword, password, confirmPassword } = formData;

		if (!name || !email) {
			return fail(400, { data: formData, errors: 'All fields are required' });
		}

		try {
			let newPassword;

			if (oldPassword) {
				if (!password || !confirmPassword)
					return fail(400, { data: formData, errors: 'All password fields are required' });

				if (password !== confirmPassword) return fail(400, { data: formData, errors: 'Passwords do not match' });

				const existingUser = await prisma.user.findUnique({
					where: { id }
				});
				if (!existingUser) return fail(400, { errors: 'User not found' });

				const match = await auth.compare(oldPassword.toString(), existingUser.password);
				if (!match) return fail(400, { data: formData, errors: 'Old password is incorrect' });

				newPassword = await auth.hash(password.toString());
			}

			await prisma.user.update({
				where: { id },
				data: {
					name: name.toString(),
					email: email.toString(),
					...(newPassword && { password: newPassword })
				}
			});

			return { success: true };
		} catch (e) {
			console.error('updateProfile:', e);
			return fail(500, { errors: 'Internal server error updating profile' });
		}
	}
};
