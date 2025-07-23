import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { writeFile } from 'node:fs/promises';
import { mkdir, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { validateProduct } from '$lib/validations';

const ITEMS_PER_PAGE = 12; // 3x4 grid layout

export const load = (async ({ locals, url }) => {
	try {
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const skip = (page - 1) * ITEMS_PER_PAGE;

		const [products, total, categories] = await Promise.all([
			prisma.product.findMany({
				include: { Image: true, categories: true },
				orderBy: { name: 'asc' },
				skip,
				take: ITEMS_PER_PAGE
			}),
			prisma.product.count(),
			prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
		]);

		return {
			products,
			categories,
			page,
			totalPages: Math.ceil(total / ITEMS_PER_PAGE)
		};
	} catch (e) {
		console.error('Error getting products: ', e);
		return { status: 500, error: 'Internal server error' };
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
				const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
				if (!allowedTypes.includes(image.type)) {
					return fail(400, {
						data: formObj,
						errors: { _errors: ['Invalid image type'] }
					});
				}

				console.log('Saving image');
				const fileName = `${Date.now()}-${image.name}`;
				imagePath = `uploads/images/${fileName}`; // Changed to public directory
				const directory = dirname(imagePath);

				try {
					await mkdir(directory, { recursive: true });
				} catch (err) {
					return fail(500, {
						data: { name, description, price, quantity, serviceCode },
						errors: { _errors: ['Failed to create upload directory'] }
					});
				}

				writeFilePromise = writeFile(imagePath, new Uint8Array(await image.arrayBuffer()));
				imageUrl = `/api/image/${fileName}`;
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

			if (imagePath) {
				await safeDeleteFile(imagePath);
			}
			return fail(500, {
				data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount },
				errors: { _errors: ['An unexpected error occurred'] }
			});
		}
	}
};

async function safeDeleteFile(path: string) {
	try {
		await unlink(path);
	} catch (err) {
		console.error(`Failed to delete file ${path}:`, err);
	}
}

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
