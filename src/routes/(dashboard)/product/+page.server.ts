import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';

const DEFAULT_ITEMS_PER_PAGE = 12;
const MAX_ITEMS_PER_PAGE = 1000;

export const load = (async ({ locals: { user }, url }) => {
	if (await auth.isAdmin(user)) return redirect(303, '/admin/product');

	try {
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const categoriesParam = url.searchParams.get('categories') || '';
		const selectedCategories = categoriesParam ? categoriesParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
		const year = url.searchParams.get('year') || 'all';
		const search = url.searchParams.get('search') || '';
		const limit = Math.min(MAX_ITEMS_PER_PAGE, Math.max(1, parseInt(url.searchParams.get('limit') || DEFAULT_ITEMS_PER_PAGE.toString())));
		const skip = (page - 1) * limit;

		// Build where clause for multiple categories
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
						categories: true,
					},
					orderBy: [
						{ sortOrder: 'asc' }, // First sort by sortOrder
						{ publicationDate: 'desc' }, // Then by publicationDate	
					],
					skip,
					take: limit
				}),
				prisma.product.count({ where })
			]);



			// // Get all products for category 16
			// const allCategoryProducts = await prisma.product.findMany({
			// 	where,
			// 	include: {
			// 		Image: { select: { url: true } },
			// 		categories: true
			// 	},
			// 	orderBy: [
			// 		{ publicationDate: 'desc' }, // First sort by publicationDate
			// 		{ name: 'asc' } // Then by name
			// 	]
			// });

			// // Custom sorting for category 16
			// const sortedProducts = allCategoryProducts.sort((a, b) => {
			// 	const aName = a.name.toLowerCase();
			// 	const bName = b.name.toLowerCase();

			// 	// Check if products start with "kenya law"
			// 	const aStartsWithKenyaLaw = aName.startsWith('kenya law');
			// 	const bStartsWithKenyaLaw = bName.startsWith('kenya law');

			// 	// Priority products to come after first two
			// 	const priorityProducts = [
			// 		'kenya law reports (environment and land vol. 2)',
			// 		'kenya law reports (employment & labour vol. 1)',
			// 		'kenya law reports (family)',
			// 		'kenya law reports (gender based violence)'
			// 	];
			// 	const aIsPriority = priorityProducts.includes(aName);
			// 	const bIsPriority = priorityProducts.includes(bName);

			// 	// First: "Kenya Law" products come before non-"Kenya Law" products
			// 	if (aStartsWithKenyaLaw && !bStartsWithKenyaLaw) return -1;
			// 	if (!aStartsWithKenyaLaw && bStartsWithKenyaLaw) return 1;

			// 	// If both are "Kenya Law" products, apply special ordering
			// 	if (aStartsWithKenyaLaw && bStartsWithKenyaLaw) {
			// 		// Priority products should come after the first two alphabetical ones
			// 		// but before all other "Kenya Law" products
			// 		if (aIsPriority && !bIsPriority) {
			// 			// Check if 'b' is among the first two alphabetically
			// 			const firstTwoAlphabetical = allCategoryProducts
			// 				.filter(
			// 					(p) =>
			// 						p.name.toLowerCase().startsWith('kenya law') && !priorityProducts.includes(p.name.toLowerCase())
			// 				)
			// 				.sort((x, y) => x.name.localeCompare(y.name))
			// 				.slice(0, 2)
			// 				.map((p) => p.name.toLowerCase());

			// 			return firstTwoAlphabetical.includes(bName) ? 1 : -1;
			// 		}
			// 		if (!aIsPriority && bIsPriority) {
			// 			// Check if 'a' is among the first two alphabetically
			// 			const firstTwoAlphabetical = allCategoryProducts
			// 				.filter(
			// 					(p) =>
			// 						p.name.toLowerCase().startsWith('kenya law') && !priorityProducts.includes(p.name.toLowerCase())
			// 				)
			// 				.sort((x, y) => x.name.localeCompare(y.name))
			// 				.slice(0, 2)
			// 				.map((p) => p.name.toLowerCase());

			// 			return firstTwoAlphabetical.includes(aName) ? -1 : 1;
			// 		}

			// 		// If both are priority or both are not priority, sort alphabetically
			// 		return a.name.localeCompare(b.name);
			// 	}

			// 	// If neither starts with "Kenya Law", sort alphabetically
			// 	return a.name.localeCompare(b.name);
			// });

			// // Apply pagination
			// products = sortedProducts.slice(skip, skip + limit);
			// total = sortedProducts.length;
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

		const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });

		// Get category counts for each category
		const categoryCounts = await Promise.all(
			categories.map(async (category) => {
				const count = await prisma.product.count({
					where: {
						isPublished: true,
						categories: { some: { id: category.id } },
						...(year !== 'all' && {
							publicationDate: {
								gte: new Date(`${parseInt(year)}-01-01`),
								lt: new Date(`${parseInt(year) + 1}-01-01`)
							}
						}),
						...(search && {
							OR: [
								{ name: { contains: search, mode: 'insensitive' } },
								{ description: { contains: search, mode: 'insensitive' } },
								{ citation: { contains: search, mode: 'insensitive' } }
							]
						})
					}
				});
				return { ...category, count };
			})
		);

		const totalPages = Math.ceil(total / limit);

		// Redirect if page is out of bounds
		if (page > totalPages && total > 0) {
			const categoriesQuery = selectedCategories.length > 0 ? selectedCategories.join(',') : '';
			const searchQuery = search ? encodeURIComponent(search) : '';
			return redirect(302, `?page=${totalPages}&categories=${categoriesQuery}&year=${year}&limit=${limit}&search=${searchQuery}`);
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
