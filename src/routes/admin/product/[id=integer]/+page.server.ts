import prisma from '$lib/server/prisma';
import { fail, json } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {} from '$app/navigation'

export const load = (async ({ params, depends }) => {
    depends('update:product')
    const id = Number(params.id);
    try {
        const product = await prisma.product.findUnique({
            where: { id }, include: {
                Image: {
                    select: { url: true }
                },
            }
        })
        if (!product) return { status: 404, error: 'Product not found' }

        return { success: true, product }
    } catch (e) {
        console.log('getProduct:', e);
        return { status: 500, error: 'Internal server error getting product details' }

    }
}) satisfies PageServerLoad;



export const actions = {
    default: async ({ request, params }) => {
        const id = Number(params.id)

        const formData = await request.formData()
        const name = formData.get('name')?.toString()
        const description = formData.get('description')?.toString()
        const priceData = formData.get('price')?.toString()
        const quantityData = formData.get('quantity')?.toString()
        const serviceCode = formData.get('serviceCode')?.toString()

        console.log('update product data fromEntries: ', Object.fromEntries(formData.entries()))

        const price = priceData ? parseFloat(priceData) : undefined
        const quantity = quantityData ? parseInt(quantityData) : undefined


        try {
            const product = await prisma.product.update({
                where: { id },
                data: { name, description, price, quantity, serviceCode },
                include: {
                    Image: {
                        select: { url: true }
                    }
                }
            })

            return { success: true, product }

        } catch (e) {
            console.log('editProd:', e);
            //@ts-ignore
            if (e.code === 'P2002') return fail(400, { error: 'A product with this service code already exists. Please use a unique service code.' })

            return fail(500, { error: 'Internal server error adding product' })

        }
    }
}