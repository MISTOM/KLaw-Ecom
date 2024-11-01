import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { REFRESH_KEY } from '$env/static/private';

import auth from '$lib/server/auth';
import jwt from 'jsonwebtoken';
import prisma from '$lib/server/prisma';


export const POST: RequestHandler = async ({ request, cookies }) => {
    const { refreshToken } = await request.json();
    if (!refreshToken) return error(400, 'Refresh token is required');

    try {
        // @ts-ignore
        const { id }: jwt.JwtPayload = jwt.verify(refreshToken, REFRESH_KEY);
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });
        if (!user) return error(404, 'User not found');
        console.log(user.refreshToken, refreshToken);
        if (user.refreshToken !== refreshToken) return error(403, 'Invalid refresh token');

        const newToken = auth.sign(user);

        //TODO - Set this globally
        const maxAge = 60 * 60 * 24 * 7; // 1 week
        cookies.set('token', newToken, { httpOnly: true, secure: true, path: '/', maxAge });

        return json({ message: 'Tokens Refreshed' }, { status: 200 });
    } catch (e) {
        //@ts-ignore
        if (e.message === 'jwt expired') return error(400, 'Token expired');
        console.error('Error generating refresh token', e);
        //@ts-ignore
        return error(e.status, e.body);
    }
}