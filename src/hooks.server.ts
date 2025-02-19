import { SECRET_KEY, REFRESH_KEY } from '$env/static/private';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { error, redirect, type Handle } from '@sveltejs/kit';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';
import { maxAge, secure } from '$lib/server/utils';

export const handle: Handle = async ({ event, resolve }) => {
	// const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://sneaker-empire-ten.vercel.app'];
	// const ALLOWED_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';
	// const ALLOWED_HEADERS = 'Content-Type, Authorization';
	// const origin = event.request.headers.get('origin') || '';

	// // Apply cors headers
	// if (event.request.method === 'OPTIONS') {
	// 	return new Response(null, {
	// 		headers: {
	// 			'Access-Control-Allow-Origin': '*',
	// 			'Access-Control-Allow-Methods': ALLOWED_METHODS,
	// 			'Access-Control-Allow-Headers': ALLOWED_HEADERS
	// 		}
	// 	});
	// }

	const token = event.cookies.get('token');
	const refreshToken = event.cookies.get('refreshToken');

	try {
		if (token) {
			await authenticateWithAccessToken(event, token, refreshToken);
		} else if (refreshToken) {
			await authenticateWithRefreshToken(event, refreshToken);
		}
	} catch (err: any) {
		clearUserSession(event);
		console.error('Authentication error:', err);
	}

	// **Admin Route Protection**
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			throw redirect(303, '/login');
		}

		if (!(await auth.isAdmin(event.locals.user))) {
			throw redirect(303, '/product');
		}
	}

	return resolve(event);
};

async function authenticateWithAccessToken(event: any, token: string, refreshToken?: string) {
	try {
		const decodedToken = jwt.verify(token, SECRET_KEY) as JwtPayload;
		event.locals.user = decodedToken;
	} catch (err: any) {
		if (err instanceof jwt.TokenExpiredError && refreshToken) {
			await refreshAccessToken(event, refreshToken);
		} else {
			throw err;
		}
	}
}

async function authenticateWithRefreshToken(event: any, refreshToken: string) {
	await refreshAccessToken(event, refreshToken);
}

async function refreshAccessToken(event: any, refreshToken: string) {
	try {
		const decodedRefreshToken = jwt.verify(refreshToken, REFRESH_KEY) as JwtPayload;
		const userId = decodedRefreshToken?.id;

		if (!userId) throw error(401, 'Invalid refresh token');

		const isValidRefreshToken = await auth.verifyRefreshToken(refreshToken, userId);
		if (!isValidRefreshToken) throw error(401, 'Invalid refresh token');

		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) throw error(401, 'User not found');

		const newToken = auth.sign(user);
		event.locals.user = jwt.verify(newToken, SECRET_KEY);

		// **Update the token cookie**
		event.cookies.set('token', newToken, {
			httpOnly: true,
			secure: secure,
			path: '/',
			maxAge
		});
	} catch (err) {
		throw err;
	}
}

function clearUserSession(event: any) {
	event.locals.user = null;
	event.cookies.delete('token', { path: '/' });
	event.cookies.delete('refreshToken', { path: '/' });
}
