import auth from '$lib/server/auth.js';
import prisma from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';
import { unlink } from 'node:fs';
import { join, basename } from 'node:path';

export const DELETE = async ({ params, locals: { user } }) => {
	const id = Number(params.id);
	if (!(await auth.isAdmin(user))) throw error(401, 'Unauthorized');

	try {
		const isProductOnOrder = await prisma.productOnOrder.findFirst({
			where: { productId: id }
		});
		if (isProductOnOrder) throw error(400, 'Product is on an order and cannot be deleted');

		const images = await prisma.image.findMany({
			where: { productId: id }
		});

		await prisma.product.delete({
			where: { id }
		});

		// Delete image files from the filesystem
		for (const image of images) {
			const imagePath = join('static/images', basename(image.url));
			console.log(`Attempting to delete image file: ${imagePath}`);
			unlink(imagePath, (err) => {
				if (err) {
					if (err.code === 'ENOENT') {
						console.warn(`File not found: ${imagePath}`);
					} else {
						console.error(`Failed to delete image file: ${imagePath}`, err);
					}
				} else {
					console.log(`Successfully deleted image file: ${imagePath}`);
				}
			});
		}

		return json({ message: 'Product deleted' });
	} catch (e) {
		console.log('deleteProduct:', e);
		//@ts-ignore
		if (e.status === 500) return error(500, 'Internal server error deleting product');
		//@ts-ignore
		return error(e.status, e?.body);
	}
};
