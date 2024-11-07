import auth from '$lib/server/auth.js';
import prisma from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';

export const DELETE = async ({ params, locals: { user } }) => {
	const id = Number(params.id);
	if (!(await auth.isAdmin(user))) throw error(401, 'Unauthorized');

	try {
		const isProductOnOrder = await prisma.productOnOrder.findFirst({
			where: { productId: id }
		});
		if (isProductOnOrder) throw error(400, 'Product is on an order and cannot be deleted');

		await prisma.product.delete({
			where: { id }
		});
		return json({ message: 'Product deleted' });
	} catch (e) {
		console.log('deleteProduct:', e);
		//@ts-ignore
		if (e.status === 500) return error(500, 'Internal server error deleting product');
		//@ts-ignore
		return error(e.status, e?.body);
	}
};
