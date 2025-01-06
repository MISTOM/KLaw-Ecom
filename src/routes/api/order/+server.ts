import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

// export const POST: RequestHandler = async ({ locals: { user }, request }) => {
//     if (!user) return error(401, 'Unauthorized saving cart: No user logged in');

//     try {
//         const cartOrderItems = await request.json(); // [{product: {id: 1,...}, quantity: 2}, {product: {id: 2,...}, quantity: 3}]
//         console.log('cartOrderItems: ', cartOrderItems);
//         const orderedItems = cartOrderItems.map((item) => {
//             return { productId: item.product.id, quantity: item.quantity }
//         });

//         //check if products exist
//         const products = await prisma.product.findMany({
//             where: {
//                 id: { in: orderedItems.map((item) => item.productId) }
//             }
//         });

//         if (products.length !== orderedItems.length) {
//             return error(400, 'some Products not found');
//         }

//         //check if products are in stock
//         const productsNotInStock = products.filter((product) => {
//             const cartItem = orderedItems.find((item) => item.productId === product.id);
//             return product.quantity < cartItem.quantity;
//         });

//         if (productsNotInStock.length > 0) {
//             return error(400, 'Some products are not in stock:\n ' + productsNotInStock.map((product) => product.name).join(', '));
//         }

//         // Update stock individually
//         for (const item of orderedItems) {
//             await prisma.product.update({
//                 where: { id: item.productId },
//                 data: { quantity: { decrement: item.quantity } }
//             });
//         }

//         //calculate total price
//         const totalPrice = products.reduce((total, product) => {
//             const cartItem = orderedItems.find((item) => item.productId === product.id);
//             return total + product.price * cartItem.quantity;
//         }, 0);

//         //save order
//         const newOrder = await prisma.order.create({
//             data: {
//                 user: { connect: { id: user.id } },
//                 totalPrice: totalPrice,
//                 ProductOnOrder: {
//                     createMany: {
//                         data: orderedItems
//                     }
//                 }
//             }
//         })

//         return json({ message: 'Cart saved', newOrder });

//     } catch (e) {
//         console.error('saveCart: ', e);

//         //@ts-ignore
//         if(e.status === 500) return error(500, 'Internal server error saving cart');
//         //@ts-ignore
//         return error(e?.status, e?.body);
//     }
// };

interface CartItem {
	product: {
		id: number;
		[key: string]: any;
	};
	quantity: number;
}

interface OrderItem {
	productId: number;
	quantity: number;
}

export const POST: RequestHandler = async ({ locals: { user }, request }) => {
	if (!user) throw error(401, 'Unauthorized: No user logged in');

	try {
		const req = await request.json();
		const cartOrderItems: CartItem[] = req.cartItems;

		if (!Array.isArray(cartOrderItems) || cartOrderItems.length === 0)
			throw error(400, 'Invalid cart data: Empty or invalid cart');

		// Map cart items to order items format
		const orderedItems: OrderItem[] = cartOrderItems.map((item) => ({
			productId: item.product.id,
			quantity: item.quantity
		}));

		// Execute all operations in a transaction
		const result = await prisma.$transaction(
			async (tx) => {
				// Fetch all products in a single query
				const products = await tx.product.findMany({
					where: { id: { in: orderedItems.map((item) => item.productId) } },
					select: {
						id: true,
						name: true,
						price: true,
						quantity: true
					}
				});

				// Validate product existence
				if (products.length !== orderedItems.length) throw error(400, 'Some products not found');

				// Create a map for efficient product lookup O(1)
				const productMap = new Map(products.map((p) => [p.id, p]));

				// Validate stock and collect products not in stock
				const productsNotInStock = orderedItems
					.filter((item) => {
						const product = productMap.get(item.productId);
						return !product || product.quantity < item.quantity;
					})
					.map((item) => productMap.get(item.productId)?.name);

				if (productsNotInStock.length > 0)
					throw error(400, `Products out of stock: ${productsNotInStock.join(', ')}`);

				// Calculate total price using the product map
				const totalPrice = orderedItems.reduce((total, item) => {
					const product = productMap.get(item.productId)!;
					return total + product.price * item.quantity;
				}, 0);

				// Update product quantities in bulk
				const updatePromises = orderedItems.map((item) =>
					tx.product.update({
						where: { id: item.productId },
						data: { quantity: { decrement: item.quantity } }
					})
				);
				await Promise.all(updatePromises);

				// Create order with all related data in a single operation
				const newOrder = await tx.order.create({
					data: {
						userId: user.id,
						totalPrice,
						billRefNumber: req?.billRefNumber,
						ProductOnOrder: {
							createMany: { data: orderedItems }
						}
					},
					include: {
						ProductOnOrder: true
					}
				});

				return { order: newOrder, totalPrice };
			}
			//  {
			//     timeout: 10000, // 10 second timeout
			//     isolationLevel: 'Serializable' // Highest isolation level for maximum consistency
			// }
		);

		return json({
			message: 'Order created successfully',
			order: result.order,
			totalPrice: result.totalPrice
		});
	} catch (e) {
		console.error(e);
		//@ts-ignore
		if (e.code === 'P2024') {
			throw error(408, 'Transaction timeout - please try again');
		}

		//@ts-ignore
		if (e.status && e.status !== 500) throw error(e.status, e.body);
		throw error(500, 'Internal server error while processing order');
	}
};

// // Domain Types
// interface CartItem {
//     product: {
//         id: number;
//         [key: string]: any;
//     };
//     quantity: number;
// }

// interface OrderItem {
//     productId: number;
//     quantity: number;
// }

// // Input Validation Schema
// const CartItemSchema = z.object({
//     product: z.object({
//         id: z.number().positive(),
//     }).nonstrict(),
//     quantity: z.number().positive().max(100) // Prevent unreasonable quantities
// });

// const CartRequestSchema = z.array(CartItemSchema).min(1).max(50); // Limit order size

// // Rate Limiting Configuration
// const RATE_LIMIT = {
//     window: 60 * 1000, // 1 minute
//     max: 30 // requests per window
// };

// // Error Types
// class OrderError extends Error {
//     constructor(public status: number, message: string) {
//         super(message);
//         this.name = 'OrderError';
//     }
// }

// // Service Layer
// class OrderService {
//     private static instance: OrderService;

//     private constructor() { }

//     static getInstance(): OrderService {
//         if (!OrderService.instance) {
//             OrderService.instance = new OrderService();
//         }
//         return OrderService.instance;
//     }

//     async checkRateLimit(userId: string): Promise<void> {
//         const key = `rate_limit:orders:${userId}`;
//         const requests = await redis.incr(key);

//         if (requests === 1) {
//             await redis.pexpire(key, RATE_LIMIT.window);
//         }

//         if (requests > RATE_LIMIT.max) {
//             throw new OrderError(429, 'Too many requests. Please try again later.');
//         }
//     }

//     private async validateProducts(
//         tx: any,
//         orderedItems: OrderItem[]
//     ): Promise<Map<number, any>> {
//         const products = await tx.product.findMany({
//             where: {
//                 id: { in: orderedItems.map(item => item.productId) },
//                 isActive: true, // Only allow active products
//                 deletedAt: null // Soft delete check
//             },
//             select: {
//                 id: true,
//                 name: true,
//                 price: true,
//                 quantity: true,
//                 sellerId: true,
//                 minimumOrderQuantity: true,
//                 maximumOrderQuantity: true
//             }
//         });

//         if (products.length !== orderedItems.length) {
//             throw new OrderError(400, 'Some products are unavailable or have been removed');
//         }

//         return new Map(products.map(p => [p.id, p]));
//     }

//     private validateOrderQuantities(
//         orderedItems: OrderItem[],
//         productMap: Map<number, any>
//     ): void {
//         const invalidItems = orderedItems.filter(item => {
//             const product = productMap.get(item.productId);
//             return (
//                 !product ||
//                 product.quantity < item.quantity ||
//                 item.quantity < product.minimumOrderQuantity ||
//                 item.quantity > product.maximumOrderQuantity
//             );
//         });

//         if (invalidItems.length > 0) {
//             const invalidProducts = invalidItems
//                 .map(item => productMap.get(item.productId)?.name)
//                 .filter(Boolean)
//                 .join(', ');
//             throw new OrderError(
//                 400,
//                 `Invalid quantities for products: ${invalidProducts}`
//             );
//         }
//     }

//     private calculatePricing(
//         orderedItems: OrderItem[],
//         productMap: Map<number, any>
//     ): {
//         totalPrice: number;
//         priceBreakdown: any[];
//     } {
//         let totalPrice = 0;
//         const priceBreakdown = [];

//         for (const item of orderedItems) {
//             const product = productMap.get(item.productId)!;
//             const itemPrice = product.price * item.quantity * PRICE_MULTIPLIER;
//             totalPrice += itemPrice;

//             priceBreakdown.push({
//                 productId: item.productId,
//                 quantity: item.quantity,
//                 unitPrice: product.price,
//                 totalPrice: itemPrice
//             });
//         }

//         return { totalPrice, priceBreakdown };
//     }

//     async createOrder(user: any, cartItems: CartItem[]) {
//         const startTime = Date.now();
//         const traceId = crypto.randomUUID();

//         try {
//             logger.info({
//                 message: 'Starting order creation',
//                 userId: user.id,
//                 traceId,
//                 itemCount: cartItems.length
//             });

//             // Validate input
//             const validatedCart = CartRequestSchema.parse(cartItems);

//             // Check rate limit
//             await this.checkRateLimit(user.id);

//             const orderedItems: OrderItem[] = validatedCart.map(item => ({
//                 productId: item.product.id,
//                 quantity: item.quantity
//             }));

//             // Process order in transaction
//             const result = await prisma.$transaction(async (tx) => {
//                 // Validate products and get product map
//                 const productMap = await this.validateProducts(tx, orderedItems);

//                 // Validate quantities
//                 this.validateOrderQuantities(orderedItems, productMap);

//                 // Calculate pricing
//                 const { totalPrice, priceBreakdown } = this.calculatePricing(
//                     orderedItems,
//                     productMap
//                 );

//                 // Update product quantities
//                 const updatePromises = orderedItems.map(item =>
//                     tx.product.update({
//                         where: { id: item.productId },
//                         data: {
//                             quantity: { decrement: item.quantity },
//                             lastOrderedAt: new Date()
//                         }
//                     })
//                 );
//                 await Promise.all(updatePromises);

//                 // Create order
//                 const newOrder = await tx.order.create({
//                     data: {
//                         userId: user.id,
//                         totalPrice,
//                         status: 'PENDING',
//                         metadata: {
//                             priceBreakdown,
//                             traceId
//                         },
//                         ProductOnOrder: {
//                             createMany: {
//                                 data: orderedItems
//                             }
//                         }
//                     },
//                     include: {
//                         ProductOnOrder: true
//                     }
//                 });

//                 // Create order audit log
//                 await tx.orderAuditLog.create({
//                     data: {
//                         orderId: newOrder.id,
//                         userId: user.id,
//                         action: 'ORDER_CREATED',
//                         metadata: {
//                             traceId,
//                             itemCount: orderedItems.length,
//                             totalPrice
//                         }
//                     }
//                 });

//                 return { order: newOrder, priceBreakdown };
//             }, {
//                 timeout: 10000,
//                 isolationLevel: 'Serializable'
//             });

//             // Record metrics
//             metrics.orderCreated({
//                 userId: user.id,
//                 orderValue: result.order.totalPrice,
//                 itemCount: orderedItems.length,
//                 processingTime: Date.now() - startTime
//             });

//             logger.info({
//                 message: 'Order created successfully',
//                 orderId: result.order.id,
//                 traceId,
//                 processingTime: Date.now() - startTime
//             });

//             return json({
//                 message: 'Order created successfully',
//                 data: {
//                     order: result.order,
//                     priceBreakdown: result.priceBreakdown
//                 },
//                 metadata: {
//                     traceId,
//                     processingTime: Date.now() - startTime
//                 }
//             });

//         } catch (e) {
//             logger.error({
//                 message: 'Error creating order',
//                 error: e,
//                 userId: user.id,
//                 traceId,
//                 processingTime: Date.now() - startTime
//             });

//             metrics.orderFailed({
//                 userId: user.id,
//                 errorType: e.name,
//                 processingTime: Date.now() - startTime
//             });

//             if (e instanceof z.ZodError) {
//                 throw error(400, 'Invalid cart data: ' + e.errors[0].message);
//             }

//             if (e instanceof OrderError) {
//                 throw error(e.status, e.message);
//             }

//             if (e.code === 'P2024') {
//                 throw error(408, 'Transaction timeout - please try again');
//             }

//             throw error(500, 'Internal server error while processing order');
//         }
//     }
// }

// // API Handler
// export const POST: RequestHandler = async ({ locals: { user }, request }) => {
//     if (!user) {
//         throw error(401, 'Unauthorized: No user logged in');
//     }

//     const cartItems = await request.json();
//     const orderService = OrderService.getInstance();
//     return await orderService.createOrder(user, cartItems);
// };
