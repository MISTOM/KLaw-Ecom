import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const POST = async ({ cookies, locals: { user } }) => {
	if (user?.id) {
		try {
			// Remove the refresh token from the database
			await prisma.user.update({
				where: { id: user.id },
				data: { refreshToken: null }
			});
		} catch (e) {
			console.error('Failed to update user refresh token:', e);
		}
	}

	// Clear the authentication cookies
	cookies.delete('token', { path: '/', secure: false });
	cookies.delete('refreshToken', { path: '/', secure: false });

	return json({ message: 'Logged out' });
};
