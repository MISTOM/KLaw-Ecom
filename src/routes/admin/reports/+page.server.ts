import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { OrderStatus } from '@prisma/client';

export const load = (async () => {
	try {
		// Use prisma.$transaction for more efficient query execution
		const [orderCounts, totalRevenue, totalPublications, categories, topPublications] = await prisma.$transaction([
			prisma.order.groupBy({
				by: ['status'],
				_count: true,
				orderBy: { status: 'asc' }
			}),
			prisma.order.aggregate({
				_sum: { totalPrice: true },
				where: { status: OrderStatus.COMPLETED }
			}),
			prisma.product.count({ where: { isPublished: true } }),
			prisma.category.findMany({
				select: {
					id: true,
					name: true,
					_count: {
						select: {
							Products: { where: { isPublished: true } }
						}
					}
				},
				orderBy: { sortOrder: 'asc' }
			}),
			prisma.product.findMany({
				select: {
					id: true,
					name: true,
					price: true,
					author: true,
					_count: { select: { ProductOnOrder: true } }
				},
				where: { isPublished: true },
				orderBy: { ProductOnOrder: { _count: 'desc' } },
				take: 10
			})
		]);

		// Create a map for more efficient status count lookup
		const statusCountMap = new Map<OrderStatus, number>();
		orderCounts.forEach((item) => {
			statusCountMap.set(item.status, typeof item._count === 'number' ? item._count : 0);
		});

		const completedOrders = statusCountMap.get(OrderStatus.COMPLETED) || 0;
		const pendingOrders = statusCountMap.get(OrderStatus.PENDING) || 0;
		const cancelledOrders = statusCountMap.get(OrderStatus.CANCELLED) || 0;
		const totalOrders = Array.from(statusCountMap.values()).reduce((sum, count) => sum + count, 0);

		return {
			orderStats: {
				totalOrders,
				completedOrders,
				pendingOrders,
				cancelledOrders,
				totalRevenue: totalRevenue._sum.totalPrice || 0
			},
			publicationStats: {
				totalPublications,
				categories: categories.map((cat) => ({
					id: cat.id,
					name: cat.name,
					count: cat._count.Products
				})),
				topPublications: topPublications.map((pub) => ({
					id: pub.id,
					name: pub.name,
					price: pub.price,
					author: pub.author,
					orderCount: pub._count.ProductOnOrder
				}))
			}
		};
	} catch (error) {
		console.error('Error loading report data:', error);
		// Return a default state on error to prevent page crash
		return {
			orderStats: {
				totalOrders: 0,
				completedOrders: 0,
				pendingOrders: 0,
				cancelledOrders: 0,
				totalRevenue: 0
			},
			publicationStats: {
				totalPublications: 0,
				categories: [],
				topPublications: []
			}
		};
	}
}) satisfies PageServerLoad;
