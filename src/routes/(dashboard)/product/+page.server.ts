import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';

const DEFAULT_ITEMS_PER_PAGE = 10;
const MAX_ITEMS_PER_PAGE = 1000;

export const load = (async ({ locals: { user }, url }) => {
	if (await auth.isAdmin(user)) return redirect(303, '/admin/product');

	try {
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const categoriesParam = url.searchParams.get('categories') || '';
		const selectedCategories = categoriesParam
			? categoriesParam
					.split(',')
					.map((id) => parseInt(id))
					.filter((id) => !isNaN(id))
			: [];
		const year = url.searchParams.get('year') || 'all';
		const search = url.searchParams.get('search') || '';
		const limit = Math.min(
			MAX_ITEMS_PER_PAGE,
			Math.max(1, parseInt(url.searchParams.get('limit') || DEFAULT_ITEMS_PER_PAGE.toString()))
		);
		const skip = (page - 1) * limit;

		let where: any = { isPublished: true };
		if (selectedCategories.length > 0) {
			where = {
				...where,
				categories: { some: { id: { in: selectedCategories } } }
			};
		}

		// Add search filter if specified
		if (search) {
			where = {
				...where,
				OR: [
					{ name: { contains: search, mode: 'insensitive' } },
					{ description: { contains: search, mode: 'insensitive' } },
					{ citation: { contains: search, mode: 'insensitive' } }
				]
			};
		}

		// Add year filter if specified
		if (year !== 'all') {
			const yearInt = parseInt(year);
			where = {
				...where,
				publicationDate: {
					gte: new Date(`${yearInt}-01-01`),
					lt: new Date(`${yearInt + 1}-01-01`)
				}
			};
		}

		// For category 16, use a different approach to prioritize "Kenya Law" products
		let products, total;

		if (selectedCategories.includes(16) && selectedCategories.length === 1) {
			// Sort using sortOrder and publicationDate for category 16 only
			[products, total] = await Promise.all([
				prisma.product.findMany({
					where,
					include: {
						Image: { select: { url: true } },
						categories: true
					},
					orderBy: [
						{ sortOrder: 'asc' }, // First sort by sortOrder
						{ publicationDate: 'desc' } // Then by publicationDate
					],
					skip,
					take: limit
				}),
				prisma.product.count({ where })
			]);
		} else {
			// Normal query for other categories
			[products, total] = await Promise.all([
				prisma.product.findMany({
					where,
					include: {
						Image: { select: { url: true } },
						categories: true
					},
					orderBy: [
						{ publicationDate: 'desc' }, // First sort by publicationDate
						{ name: 'asc' } // Then by name
					],
					skip,
					take: limit
				}),
				prisma.product.count({ where })
			]);
		}

		const productFilterForCounts: any = {
			isPublished: true
		};

		if (year !== 'all') {
			const yearInt = parseInt(year);
			productFilterForCounts.publicationDate = {
				gte: new Date(`${yearInt}-01-01`),
				lt: new Date(`${yearInt + 1}-01-01`)
			};
		}

		if (search) {
			productFilterForCounts.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{ citation: { contains: search, mode: 'insensitive' } }
			];
		}

		const categoriesWithCounts = await prisma.category.findMany({
			orderBy: { sortOrder: 'asc' },
			include: {
				_count: {
					select: {
						Products: { where: productFilterForCounts }
					}
				}
			}
		});

		const categoryCounts = categoriesWithCounts.map(({ _count, ...category }) => ({
			...category,
			count: _count.Products
		}));

		const totalPages = Math.ceil(total / limit);

		// Redirect if page is out of bounds
		if (page > totalPages && total > 0) {
			const categoriesQuery = selectedCategories.length > 0 ? selectedCategories.join(',') : '';
			const searchQuery = search ? encodeURIComponent(search) : '';
			return redirect(
				302,
				`?page=${totalPages}&categories=${categoriesQuery}&year=${year}&limit=${limit}&search=${searchQuery}`
			);
		}

		return {
			products,
			categories: categoryCounts,
			page,
			totalPages,
			totalResults: total,
			selectedCategories
		};
	} catch (e) {
		console.error('getPublishedProducts: ', e);
		return { status: 500, error: 'Internal server error getting published products' };
	}
}) satisfies PageServerLoad;
