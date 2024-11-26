import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { redirect, fail } from '@sveltejs/kit';
import { writeFile } from 'node:fs/promises';
import { mkdir, unlink } from 'node:fs';
import { dirname } from 'node:path';

export const load = (async ({ locals }) => {
	try {
		const products = await prisma.product.findMany({
			include: { Image: true },
			orderBy: { id: 'desc' }
		});
		return { products };
	} catch (e) {}
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const price = formData.get('price')?.toString();
		const quantity = formData.get('quantity')?.toString();
		const serviceCode = formData.get('serviceCode')?.toString();
		const author = formData.get('author')?.toString();
		const publicationDateData = formData.get('publicationDate')?.toString();
		const pageCount = formData.get('pageCount')?.toString();

		const publicationDate = publicationDateData ? new Date(publicationDateData) : undefined;

		const image = formData.get('image') as File;
		console.log('productImage: ', image);

		if (
			!name ||
			!description ||
			!price ||
			!quantity ||
			!serviceCode ||
			!author ||
			!publicationDate ||
			!pageCount
		) {
			return fail(400, {
				data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
				errors: 'All fields are required'
			});
		}

		let imagePath = null;
		try {
			let imageUrl = null;
			let writeFilePromise;
			if (image && image.name) {
				console.log('Saving image');
				const fileName = `${Date.now()}-${image.name}`;
				imagePath = `static/images/${fileName}`;
				const directory = dirname(imagePath);

				// Ensure the directory exists
				mkdir(directory, { recursive: true }, (err) =>
					fail(500, {
						data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
						errors: 'Failed to create directory'
					})
				);

				writeFilePromise = writeFile(imagePath, new Uint8Array(await image.arrayBuffer()));
				imageUrl = `/images/${fileName}`;
			}

			const isProductExist = await prisma.product.findUnique({
				where: { serviceCode }
			});

			if (isProductExist)
				return fail(400, {
					data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
					errors: 'Product with this service code already exists'
				});

			const newProductPromise = prisma.product.create({
				data: {
					name,
					description,
					price: parseFloat(price),
					quantity: parseInt(quantity),
					serviceCode,
					author,
					publicationDate,
					pageCount: parseInt(pageCount),
					Image: imageUrl ? { create: { url: imageUrl } } : undefined
				},
				include: { Image: true }
			});

			const [newProduct] = await Promise.all([newProductPromise, imageUrl ? writeFilePromise : Promise.resolve()]);
			console.log('newProduct:', newProduct);

			return {
				status: 200,
				body: {
					product: newProduct
				}
			};
		} catch (e) {
			console.log('addProduct error: ', e);

			// Delete the image if it was saved
			imagePath
				? unlink(imagePath, (err) => {
						if (err) console.error('Failed to delete image', err);
					})
				: null;

			return fail(500, {
				data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
				errors: 'Internal server error'
			});
		}
	}
};
