import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';

const ITEMS_PER_PAGE = 12;

export const load = (async ({ locals: { user }, url }) => {
	if (await auth.isAdmin(user)) return redirect(303, '/admin/product');

	try {
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const categoryId = url.searchParams.get('category') || 'all';
		const year = url.searchParams.get('year') || 'all';
		const skip = (page - 1) * ITEMS_PER_PAGE;

		// Validate categoryId exists if not 'all'
		let where: any = { isPublished: true };
		if (categoryId !== 'all') {
			const category = await prisma.category.findUnique({
				where: { id: parseInt(categoryId) }
			});
			if (category) {
				where = {
					...where,
					categories: { some: { id: parseInt(categoryId) } }
				};
			}
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

		if (categoryId === '16') {
			// Get all products for category 16
			const allCategoryProducts = await prisma.product.findMany({
				where,
				include: {
					Image: { select: { url: true } },
					categories: true
				},
				orderBy: [
					{ publicationDate: 'desc' }, // First sort by publicationDate
					{ name: 'asc' } // Then by name
				]
			});

			// Custom sorting for category 16
			const sortedProducts = allCategoryProducts.sort((a, b) => {
				const aName = a.name.toLowerCase();
				const bName = b.name.toLowerCase();

				// Check if products start with "kenya law"
				const aStartsWithKenyaLaw = aName.startsWith('kenya law');
				const bStartsWithKenyaLaw = bName.startsWith('kenya law');

				// Priority products to come after first two
				const priorityProducts = [
					'kenya law reports (environment and land vol. 2)',
					'kenya law reports (employment & labour vol. 1)',
					'kenya law reports (family)',
					'kenya law reports (gender based violence)'
				];
				const aIsPriority = priorityProducts.includes(aName);
				const bIsPriority = priorityProducts.includes(bName);

				// First: "Kenya Law" products come before non-"Kenya Law" products
				if (aStartsWithKenyaLaw && !bStartsWithKenyaLaw) return -1;
				if (!aStartsWithKenyaLaw && bStartsWithKenyaLaw) return 1;

				// If both are "Kenya Law" products, apply special ordering
				if (aStartsWithKenyaLaw && bStartsWithKenyaLaw) {
					// Priority products should come after the first two alphabetical ones
					// but before all other "Kenya Law" products
					if (aIsPriority && !bIsPriority) {
						// Check if 'b' is among the first two alphabetically
						const firstTwoAlphabetical = allCategoryProducts
							.filter(
								(p) =>
									p.name.toLowerCase().startsWith('kenya law') && !priorityProducts.includes(p.name.toLowerCase())
							)
							.sort((x, y) => x.name.localeCompare(y.name))
							.slice(0, 2)
							.map((p) => p.name.toLowerCase());

						return firstTwoAlphabetical.includes(bName) ? 1 : -1;
					}
					if (!aIsPriority && bIsPriority) {
						// Check if 'a' is among the first two alphabetically
						const firstTwoAlphabetical = allCategoryProducts
							.filter(
								(p) =>
									p.name.toLowerCase().startsWith('kenya law') && !priorityProducts.includes(p.name.toLowerCase())
							)
							.sort((x, y) => x.name.localeCompare(y.name))
							.slice(0, 2)
							.map((p) => p.name.toLowerCase());

						return firstTwoAlphabetical.includes(aName) ? -1 : 1;
					}

					// If both are priority or both are not priority, sort alphabetically
					return a.name.localeCompare(b.name);
				}

				// If neither starts with "Kenya Law", sort alphabetically
				return a.name.localeCompare(b.name);
			});

			// Apply pagination
			products = sortedProducts.slice(skip, skip + ITEMS_PER_PAGE);
			total = sortedProducts.length;
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
					take: ITEMS_PER_PAGE
				}),
				prisma.product.count({ where })
			]);
		}

		const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });

		const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

		// Redirect if page is out of bounds
		if (page > totalPages && total > 0) {
			return redirect(302, `?page=${totalPages}&category=${categoryId}&year=${year}`);
		}

		return {
			products,
			categories,
			page,
			totalPages
		};
	} catch (e) {
		console.error('getPublishedProducts: ', e);
		return { status: 500, error: 'Internal server error getting published products' };
	}
}) satisfies PageServerLoad;
