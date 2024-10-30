import { goto } from '$app/navigation';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData()
        console.log(formData)
        const name = formData.get('name')
        const email = formData.get('email')
        const password = formData.get('password')

        if (!name || !email || !password) {
            return {
                data: { name, email },
                errors: 'Please fill in all fields'
            }
        }

        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: email.toString()
                }
            })
            if (user) {
                return {
                    data: { name, email },
                    errors: 'User already exists'
                }
            }
            const hashedPassword = await auth.hash(password.toString())
            const newUser = await prisma.user.create({
                data: {
                    name: name.toString(),
                    email: email.toString(),
                    password: hashedPassword,
                    role: {
                        connect: {
                            name: 'USER'
                        }
                    }
                }
            })
            console.log(newUser)
        } catch (e) {
            console.log(e)
            return {
                data: { name, email, password },
                errors: 'An error occurred'
            }
        }
    }
} satisfies Actions