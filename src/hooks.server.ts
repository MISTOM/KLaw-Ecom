import jwt, { type JwtPayload } from 'jsonwebtoken';
import { error, redirect, type Handle } from '@sveltejs/kit';
import { SECRET_KEY, REFRESH_KEY } from '$env/static/private';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('token');
	const refreshToken = event.cookies.get('refreshToken');

	if (token) {
		try {
			const decodedToken = jwt.verify(token, SECRET_KEY) as JwtPayload;
			event.locals.user = decodedToken;

			const currentTime = Math.floor(Date.now() / 1000);
			if (decodedToken.exp && decodedToken.exp - currentTime < 60 && refreshToken) {
				// Token expires in 1 minute
				console.log('Refreshing token');

				// Decode the refresh token to get the user ID
				const decodedRefreshToken = jwt.verify(refreshToken, REFRESH_KEY) as JwtPayload;
				const userId = decodedRefreshToken?.id;

				if (!userId) throw error(401, 'Invalid refresh token');

				// Verify the refresh token
				const isValidRefreshToken = await auth.verifyRefreshToken(refreshToken, userId);

				if (isValidRefreshToken) {
					const user = await prisma.user.findUnique({
						where: { id: userId }
					});

					if (user) {
						const newToken = auth.sign(user);
						const maxAge = 60 * 60 * 24 * 7; // 1 week
						event.cookies.set('token', newToken, { httpOnly: true, secure: true, path: '/', maxAge });
					} else {
						clearUserSession(event);
					}
				} else {
					clearUserSession(event);
				}
			}
		} catch (e) {
			clearUserSession(event);
			//@ts-ignore
			console.error('Token verification error:', e?.message);
		}
	}

	// Check if the user is trying to access an admin route
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			return redirect(303, '/login');
		}

		if (!(await auth.isAdmin(event.locals.user))) {
			return redirect(303, '/product');
		}
	}

	return await resolve(event);
};

function clearUserSession(event: any) {
	event.locals.user = null;
	event.cookies.delete('token', { path: '/' });
	event.cookies.delete('refreshToken', { path: '/' });
}
