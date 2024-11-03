import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';


export const GET = async ({ locals: { user } }) => {
    // TODO 
    if (!user?.id) {
        return error(401, 'Unauthorized');
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: user.id },
            include: { CartItem: { include: { product: true } } }
        });

        return json(cart?.CartItem || []);
    } catch (error) {
        return json({ error: 'Failed to load cart' }, { status: 500 });
    }
};

export const POST = async ({ request, locals: { user } }) => {
    if (!user?.id) {
        return error(401, 'Unauthorized');
    }

    const cartItems = await request.json(); // [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 3 }]

    try {

        // TODO - Review this approach
        await prisma.cart.upsert({
            where: { userId: user.id },
            update: {
                CartItem: {
                    deleteMany: {}, // Clear existing items 

                    //@ts-ignore
                    create: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    }))
                }
            },
            create: {
                userId: user.id,
                CartItem: {
                    //@ts-ignore
                    create: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    }))
                }
            }
        });
        return json({ message: 'Cart saved' });
    } catch (e) {
        return error(500, 'Error saving cart');
    }
};