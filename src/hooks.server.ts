import jwt, { type JwtPayload } from 'jsonwebtoken';
import { redirect, type Handle } from '@sveltejs/kit';
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
				//expires in 1 minute
				console.log('Refreshing token');
				// Refresh the token

				// @ts-ignore
				const { id }: jwt.JwtPayload = jwt.verify(refreshToken, REFRESH_KEY);
				const user = await prisma.user.findUnique({
					where: { id: id }
				});

				if (user && user.refreshToken === refreshToken) {
					const newToken = auth.sign(user);
					const maxAge = 60 * 60 * 24 * 7; // 1 week
					event.cookies.set('token', newToken, { httpOnly: true, secure: true, path: '/', maxAge });
				} else {
					event.locals.user = null;
					event.cookies.delete('token', { path: '/' });
					event.cookies.delete('refreshToken', { path: '/' });
				}
			}
		} catch (e) {
			event.locals.user = null;
			event.cookies.delete('token', { path: '/' });
			event.cookies.delete('refreshToken', { path: '/' });
			//@ts-ignore
			console.log(e.message);
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
