import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { writeFile } from 'node:fs/promises';
import { mkdir, unlink } from 'node:fs';
import { dirname } from 'node:path';

export const load = (async ({ locals }) => {
	try {
		const productsPromise = prisma.product.findMany({
			include: { Image: true, categories: true },
			orderBy: { createdAt: 'desc' }
		});
		const categoriesPromise = prisma.category.findMany();

		const [products, categories] = await Promise.all([productsPromise, categoriesPromise]);

		return { products, categories };
	} catch (e) {
		console.log('Error getting products: ', e);
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const price = formData.get('price')?.toString();
		const quantity = formData.get('quantity')?.toString();
		const serviceCode = Math.floor(Math.random() * 87654321).toString(); //auto generate service code  /* formData.get('serviceCode')?.toString();*/
		const author = formData.get('author')?.toString();
		const publicationDateData = formData.get('publicationDate')?.toString();
		const pageCount = formData.get('pageCount')?.toString();
		const categoryIds = formData.getAll('categoryIds').map((id) => parseInt(id.toString()));
		const publicationDate = publicationDateData ? new Date(publicationDateData) : undefined;

		const image = formData.get('image') as File;
		console.log('productImage: ', image, serviceCode);

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
				errors: 'All fields and atleast one category are required'
			});
		}

		let imagePath = null;
		try {
			// Check if product with this service code already exists
			const isProductExist = await prisma.product.findUnique({
				where: { serviceCode }
			});
			if (isProductExist)
				return fail(400, {
					data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
					errors: 'Product with this service code already exists'
				});

			// Validate category ids
			const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
			if (categories.length !== categoryIds.length) {
				return fail(400, {
					data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
					errors: 'Invalid category ids'
				});
			}

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
					Image: imageUrl ? { create: { url: imageUrl } } : undefined,
					categories: { connect: categoryIds.map((id) => ({ id })) }
				},
				include: { Image: true, categories: true }
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
// let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
// let generatedCodes = new Set<string>();

// /**
//  * Generates a unique code
//  * @param {Number} numChars Character length of the code
//  * @returns {String} Unique code
//  */
// function generateUniqueCode(numChars: number): string {
// 	let code;
// 	do {
// 		code = "";
// 		for (let j = 0; j < numChars; j++) {
// 			let index = Math.floor(Math.random() * chars.length);
// 			code += chars[index];
// 		}
// 	} while (generatedCodes.has(code));

// 	generatedCodes.add(code);
// 	return code;
// }
