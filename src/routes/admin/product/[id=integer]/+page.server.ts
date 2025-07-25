import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateProduct } from '$lib/validations';
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';

export const load = (async ({ params, depends }) => {
	depends('update:product');
	const id = Number(params.id);

	try {
		const productPromise = prisma.product.findUnique({
			where: { id },
			include: {
				Image: {
					select: { url: true }
				},
				categories: {
					select: { id: true, name: true }
				}
			}
		});
		const categoriesPromise = prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });

		const [product, categories] = await Promise.all([productPromise, categoriesPromise]);

		if (!product) return { status: 404, error: 'Product not found' };

		return { success: true, product, categories };
	} catch (e) {
		console.log('getProduct:', e);
		return { status: 500, error: 'Internal server error getting product details' };
	}
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const formObj = Object.fromEntries(formData);
		const parsedData = {
			...formObj,
			price: formObj.price ? parseFloat(formObj.price as string) : undefined,
			quantity: formObj.quantity ? parseInt(formObj.quantity as string) : undefined,
			pageCount: formObj.pageCount ? parseInt(formObj.pageCount as string) : undefined,
			categoryIds: formData.getAll('categoryIds').map((id) => parseInt(id as string)),
			citation: formObj.citation || undefined
		};

		const validation = validateProduct(parsedData);
		if (!validation.success) {
			return fail(400, {
				data: formObj,
				errors: validation.errors
			});
		}
		const {
			name,
			description,
			price,
			quantity,
			author,
			citation,
			publicationDate: publicationDateData,
			pageCount,
			categoryIds
		} = validation.data!;
		const publicationDate = publicationDateData ? new Date(publicationDateData) : undefined;
		const serviceCode = Math.floor(Math.random() * 87654321).toString(); //auto generate service code  /* formData.get('serviceCode')?.toString();*/

		// Process new image upload if provided
		const newImage = formData.get('newImage') as File | null;
		let imageUrl: string | undefined;

		if (newImage && newImage.name) {
			const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
			if (!allowedTypes.includes(newImage.type)) {
				return fail(400, {
					data: formObj,
					errors: { _errors: ['Invalid image type'] }
				});
			}

			const existingImages = await prisma.image.findMany({
				where: { productId: id }
			});

			// For each, delete file from disk if it exists, then remove the DB record
			for (const img of existingImages) {
				const oldFilePath = `uploads/images/${img.url.split('/').pop()}`;
				unlink(oldFilePath).catch((e) => console.log(`Old image not found or not removed: ${oldFilePath}\n ${e}`));
				// Remove the image record
				await prisma.image.delete({
					where: { id: img.id }
				});
			}

			const fileName = `${Date.now()}-${newImage.name}`;
			const imagePath = `uploads/images/${fileName}`;
			const directory = dirname(imagePath);
			// Ensure images directory exists
			await mkdir(directory, { recursive: true });
			await writeFile(imagePath, new Uint8Array(await newImage.arrayBuffer()));
			imageUrl = `/api/image/${fileName}`;
		}

		try {
			// Ensure the serviceCode is unique except for the current product
			const existing = await prisma.product.findUnique({ where: { serviceCode } });
			if (existing && existing.id !== id) {
				return fail(400, {
					data: formObj,
					errors: { _errors: ['Product with this service code already exists'] }
				});
			}

			// Validate category IDs
			const cats = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
			if (cats.length !== categoryIds.length) {
				return fail(400, {
					data: formObj,
					errors: { categoryIds: ['Invalid category IDs'] }
				});
			}

			// Update product with validated data
			const product = await prisma.product.update({
				where: { id },
				data: {
					name,
					description,
					price,
					quantity,
					serviceCode,
					author,
					citation,
					publicationDate,
					pageCount,
					categories: { set: categoryIds.map((id) => ({ id })) },
					...(imageUrl
						? {
								Image: {
									create: { url: imageUrl }
								}
							}
						: {})
				}
			});

			return { success: true, product };
		} catch (e) {
			console.log('editProd error: ', e);
			return fail(500, { errors: { _errors: ['Internal server error updating product'] } });
		}
	}
};
