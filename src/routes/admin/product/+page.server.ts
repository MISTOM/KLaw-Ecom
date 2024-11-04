import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { redirect, fail } from '@sveltejs/kit';
import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs';
import { dirname } from 'node:path';

export const load = (async ({ locals }) => {
    try {
        const products = await prisma.product.findMany({
            include: { Image: true }
        })
        return { products }
    } catch (e) {

    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    addproduct: async ({ request }) => {
        const formData = await request.formData();

        const name = formData.get('name')?.toString();
        const description = formData.get('description')?.toString();
        const price = formData.get('price')?.toString();
        const quantity = formData.get('quantity')?.toString();
        const serviceCode = formData.get('serviceCode')?.toString();

        const image = formData.get('image') as File;
        console.log('productImage: ', image);

        if (!name || !description || !price || !quantity || !serviceCode) {
            return fail(400, {
                data: { name, description, price, quantity, serviceCode },
                errors: 'All fields are required'
            });
        }

        try {
            let imageUrl = null;
            let writeFilePromise;
            if (image && image.name) {
                console.log('Saving image');
                const fileName = `${Date.now()}-${image.name}`
                const imagePath = `static/images/${fileName}`;
                const directory = dirname(imagePath);

                // Ensure the directory exists
                mkdir(directory, { recursive: true }, (err) =>
                    fail(500, {
                        data: { name, description, price, quantity, serviceCode },
                        errors: 'Failed to create directory'
                    })
                );

                writeFilePromise = writeFile(imagePath, new Uint8Array(await image.arrayBuffer()));
                imageUrl = `/images/${fileName}`;
            }

            const isProductExist = await prisma.product.findUnique({
                where: { serviceCode }
            });

            if (isProductExist) {
                return fail(400, {
                    data: { name, description, price, quantity, serviceCode },
                    errors: 'Product with this service code already exists'
                });
            }

            const newProductPromise = prisma.product.create({
                data: {
                    name,
                    description,
                    price: parseFloat(price),
                    quantity: parseInt(quantity),
                    serviceCode,
                    Image: imageUrl
                        ? {
                            create: {
                                url: imageUrl
                            }
                        }
                        : undefined
                },
                include: {
                    Image: true
                }
            });

            const [newProduct] = await Promise.all([
                newProductPromise,
                imageUrl ? writeFilePromise : Promise.resolve()
            ]);
            console.log('newProduct:', newProduct);

            return {
                status: 200,
                body: {
                    product: newProduct
                }
            };
        } catch (e) {
            console.log('addProduct:', e);
            return fail(500, {
                data: { name, description, price, quantity, serviceCode },
                errors: 'Internal server error'
            });
        }
    }
};
