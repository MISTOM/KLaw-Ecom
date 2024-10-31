import { SECRET_KEY } from "$env/static/private";
import jwt from "jsonwebtoken";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {


    //Verify the user's token and add the user to the locals object
    // const token = event.request.headers.get('Authorization')?.split(' ')[1]; // Bearer <token>
    const token = event.cookies.get('token');
    if (token) {
        try {
            event.locals.user = jwt.verify(token, SECRET_KEY);
        } catch (e) {
            event.locals.user = null;
            event.cookies.delete('token', {path: '/'});
            //@ts-ignore
            console.log('Unverified User:', e.message);
        }
    }

    return await resolve(event);

}