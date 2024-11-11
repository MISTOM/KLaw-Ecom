
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { user } }) => {
    if (!user) throw redirect(303, '/login');
   
}) satisfies PageServerLoad