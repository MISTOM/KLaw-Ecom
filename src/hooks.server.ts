import { SECRET_KEY } from "$env/static/private";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { redirect, type Handle } from "@sveltejs/kit";
import auth from '$lib/server/auth'
import { Roles } from "@prisma/client";



export const handle: Handle = async ({ event, resolve }) => {

    //Verify the user's token and add the user to the locals object
    // const token = event.request.headers.get('Authorization')?.split(' ')[1]; // Bearer <token>
    const token = event.cookies.get('token');



    if (token) {
        try {
            event.locals.user = jwt.verify(token, SECRET_KEY) as JwtPayload; // Add user to locals user: eg. {id: 1, roleId: 1}
        } catch (e) {
            event.locals.user = null;
            event.cookies.delete('token', { path: '/' });
            //@ts-ignore
            console.log('Hooks error', e);

            //TODO - better error handling
        }

        const roles = await auth.getRoles()
        const adminRole = roles.find(role => role.name === Roles.ADMIN)
        
        //check if user is admin
        if (event.url.pathname.startsWith('/admin') && (!adminRole || event.locals.user?.role !== adminRole.id)) {
    
            throw redirect(303, '/product')
        }
    }

    return await resolve(event);

}