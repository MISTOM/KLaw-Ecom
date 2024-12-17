import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ params: { orderid }, locals: { user } }) => {
	// Cancel an order
	if (!user) return error(401, 'Unauthorized');

	const id = parseInt(orderid);

	try {
		const result = await prisma.$transaction(async (tx) => {
			const order = await tx.order.findUnique({ where: { id }, include: { ProductOnOrder: true } });

			if (!order) throw error(404, 'Order not found');
			if (order.userId !== user.id) throw error(403, 'You are not authorized to cancel this order');

			if (order.status === 'CANCELLED') throw error(400, 'Order is already cancelled');
			if (order.status === 'COMPLETED') throw error(400, 'Completed orders cannot be cancelled');

			const updatedOrder = await tx.order.update({
				where: { id },
				data: { status: 'CANCELLED' }
			});

			// Restore stock
			const updateProductPromises = order.ProductOnOrder.map((product) => {
				return tx.product.update({
					where: { id: product.productId },
					data: {
						quantity: {
							increment: product.quantity
						}
					}
				});
			});
			await Promise.all(updateProductPromises);
			return updatedOrder;
		});
		return json({ message: 'Order Cancelled Successfully', order: result });
	} catch (e) {
		console.error(e);

		//@ts-ignore
		if (e.status && e.status !== 500) throw error(e.status, e.message);
		return error(500, 'Internal server error');
	}
};
