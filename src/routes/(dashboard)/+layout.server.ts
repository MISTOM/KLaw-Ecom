import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../login/$types";

export const load = (async ({ locals: { user } }) => {
    if (!user) redirect(301, '/login')
}) satisfies PageServerLoad