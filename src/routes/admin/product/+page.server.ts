import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { writeFile } from 'node:fs/promises';
import { mkdir, unlink } from 'node:fs';
import { dirname } from 'node:path';
import { validateProduct } from '$lib/validations';

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

		// Convert formData to an object for validation
		const formObj = Object.fromEntries(formData);
		const parsedData = {
			...formObj,
			price: formObj.price ? parseFloat(formObj.price as string) : undefined,
			quantity: formObj.quantity ? parseInt(formObj.quantity as string) : undefined,
			pageCount: formObj.pageCount ? parseInt(formObj.pageCount as string) : undefined,
			categoryIds: formData.getAll('categoryIds').map((id) => parseInt(id as string))
		};
		const validation = validateProduct(parsedData);

		const serviceCode = Math.floor(Math.random() * 87654321).toString(); //auto generate service code  /* formData.get('serviceCode')?.toString();*/
		const image = (formObj.image || null) as File | null;

		// If product data is invalid, return errors
		if (!validation.success) {
			const { image: _, ...formData } = formObj;
			return fail(400, {
				data: formData,
				errors: validation.errors
			});
		}

		const {
			name,
			description,
			price,
			quantity,
			author,
			publicationDate: publicationDateData,
			pageCount,
			categoryIds
		} = validation.data!;
		const publicationDate = publicationDateData ? new Date(publicationDateData) : '';

		let imagePath = null;
		try {
			// Check if product with this service code already exists
			const isProductExist = await prisma.product.findUnique({
				where: { serviceCode }
			});
			if (isProductExist)
				return fail(400, {
					data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
					errors: { _errors: ['Product with this service code already exists'] }
				});

			// Validate category ids
			const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
			if (categories.length !== categoryIds.length) {
				return fail(400, {
					data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
					errors: { categoryIds: ['Invalid category ID'] }
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
						errors: { _errors: ['Internal server err: create dir'] }
					})
				);

				writeFilePromise = writeFile(imagePath, new Uint8Array(await image.arrayBuffer()));
				imageUrl = `/images/${fileName}`;
			}

			const newProductPromise = prisma.product.create({
				data: {
					name,
					description,
					price,
					quantity,
					serviceCode,
					author,
					publicationDate,
					pageCount,
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
				errors: { _errors: ['An unexpected error occurred'] }
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
