import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load = (async ({ locals: { user } }) => {

    if(user){
        console.log('getting loggedInUser Details...')
        const loggedInUser = await prisma.user.findUnique({
            where:{ id: user.id }
        })
        return { user: loggedInUser };
    }

}) satisfies LayoutServerLoad;