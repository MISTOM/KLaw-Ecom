import { API_CLIENT_ID, KEY, SECRET, SERVICE_ID } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import prisma from '$lib/server/prisma';

export const load = (async ({ locals: { user }, url: { origin } }) => {
	if (!user) redirect(302, '/login');

	const cart = await prisma.cart.findUnique({
		where: {
			userId: user.id
		},
		include: {
			CartItem: { include: { product: true } },
			user: { select: { name: true, email: true, phoneNumber: true, idNumber: true } }
		}
	});
	if (!cart) {
		console.error('Cart not found');
		return { error: 'Cart not found' };
	}

	//calculate total price
	const totalPrice = cart.CartItem.reduce((total, item) => total + item.product.price * item.quantity, 0);

	// Prepare payment details
	const paymentDetails = {
		apiClientID: API_CLIENT_ID, // Your Pesaflow API Client ID
		amountExpected: totalPrice,
		serviceID: SERVICE_ID, // Your service ID
		clientIDNumber: cart.user.idNumber || '0',
		currency: 'KES',
		billRefNumber: `ORDER-${Date.now()}`, // Unique order reference
		billDesc: 'Product Purchase',
		clientName: cart.user.name || cart.user.email,
		secret: SECRET
	};

	// Data string for secure hash
	const dataString = [
		paymentDetails.apiClientID,
		paymentDetails.amountExpected,
		paymentDetails.serviceID,
		paymentDetails.clientIDNumber,
		paymentDetails.currency,
		paymentDetails.billRefNumber,
		paymentDetails.billDesc,
		paymentDetails.clientName,
		paymentDetails.secret
	].join('');

	// Generate secure hash
	const secureHash = generateSecureHash(dataString, KEY);

	return {
		paymentDetails: {
			...paymentDetails,
			secureHash,
			callBackURLOnSuccess: `${origin}/checkout`,
			callBackURLOnFail: `${origin}/checkout`,
			notificationURL: `${origin}/api/order/notification_url`,
			clientEmail: cart.user.email,
			clientMSISDN: cart.user.phoneNumber || '0700000000',
			pictureURL: `${origin}/kLawLogo.png`
		}
	};
}) satisfies PageServerLoad;

/**
 * Generate a secure hash using HMAC with SHA256
 * @param dataString String to hash
 * @param secretKey Secret key to use for hashing
 * @returns Base64 encoded hash
 */
function generateSecureHash(dataString: string, secretKey: string): string {
	// Create HMAC with SHA256
	const hmac = createHmac('sha256', secretKey);

	// Update with data and generate hash
	hmac.update(dataString);

	// Generate base64 encoded hash
	return hmac.digest('base64');
}

// function verifySecureHash(dataString: string, secretKey: string, providedHash: string): boolean {
//     const calculatedHash = generateSecureHash(dataString, secretKey);
//     return calculatedHash === providedHash;
// }
