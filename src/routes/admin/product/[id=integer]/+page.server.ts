import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
		const categoriesPromise = prisma.category.findMany();

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
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const priceData = formData.get('price')?.toString();
		const quantityData = formData.get('quantity')?.toString();
		const serviceCode = Math.floor(Math.random() * 8765430).toString(); //auto generate service code  /* formData.get('serviceCode')?.toString();*/
		const author = formData.get('author')?.toString();
		const publicationDateData = formData.get('publicationDate')?.toString();
		const pageCountData = formData.get('pageCount')?.toString();
		const categoryIds = formData.getAll('categoryIds').map((id) => parseInt(id.toString()));

		// console.log('update product data fromEntries: ', Object.fromEntries(formData.entries())); : use Object.fromEntries to get all form data

		const price = priceData ? parseFloat(priceData) : 0;
		const quantity = quantityData ? parseInt(quantityData) : 0;
		const publicationDate = publicationDateData ? new Date(publicationDateData) : undefined;
		const pageCount = pageCountData ? parseInt(pageCountData) : 0;
		if (!name || !description || !serviceCode || !author || !publicationDate || !categoryIds.length) {
			return fail(400, {
				data: { name, description, price, quantity, serviceCode, author, publicationDate, pageCount, categoryIds },
				errors: 'All fields and atleast one category are required'
			});
		}

		try {
			// Check if product with this service code already exists
			const isProductExist = await prisma.product.findUnique({
				where: { serviceCode }
			});
			if (isProductExist && isProductExist.id !== id)
				return fail(400, {
					data: {
						name,
						description,
						price,
						quantity,
						serviceCode,
						author,
						publicationDate,
						pageCount,
						categoryIds
					},
					errors: 'Product with this service code already exists'
				});

			// Validate category ids
			const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
			if (categories.length !== categoryIds.length) {
				return fail(400, {
					data: {
						name,
						description,
						price,
						quantity,
						serviceCode,
						author,
						publicationDate,
						pageCount,
						categoryIds
					},
					errors: 'Invalid category ids'
				});
			}

			// Update product
			const product = await prisma.product.update({
				where: { id },
				data: {
					name,
					description,
					price,
					quantity,
					serviceCode,
					author,
					publicationDate,
					pageCount,
					categories: { set: categoryIds.map((id) => ({ id })) }
				}
			});

			return { success: true, product };
		} catch (e) {
			console.log('editProd: ', e);

			//@ts-ignore
			return fail(500, { errors: 'Internal server error adding product' });
		}
	}
};
