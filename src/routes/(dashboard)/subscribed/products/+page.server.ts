import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import auth from '$lib/server/auth';

/**
 * Load function for subscribed-only products page
 * Simple product catalogue for subscribers
 */
export const load = (async ({ locals: { user, isSubscribed } }) => {
	// Reason: Redirect admins to admin product page to maintain role separation
	if (await auth.isAdmin(user)) return redirect(303, '/admin/product');

	// Reason: Redirect non-authenticated users to login with return path
	if (!user) {
		const returnPath = encodeURIComponent('/subscribed/products');
		throw redirect(303, `/login?redirectTo=${returnPath}`);
	}

	// Reason: Redirect non-subscribed users to subscription page to encourage conversion
	if (!isSubscribed) {
		throw redirect(303, '/subscription?reason=premium-access');
	}

	try {
		// Generate simple dummy premium products data
		const products = generatePremiumProducts();

		return {
			products
		};
	} catch (e) {
		console.error('Error loading subscribed products:', e);
		return { status: 500, error: 'Internal server error' };
	}
}) satisfies PageServerLoad;

/**
 * Generates simple dummy premium products for subscribers
 */
function generatePremiumProducts() {
	return [
		{
			id: 1001,
			name: 'Constitutional Court Judgments Collection 2024',
			description: 'Comprehensive collection of landmark constitutional court decisions from 2024.',
			price: 15000,
			author: 'Chief Justice Martha Koome',
			Image: [{ url: '/coat-of-arms.jpg' }]
		},
		{
			id: 1002,
			name: 'Advanced Commercial Law Compendium',
			description: 'Exclusive compilation of complex commercial law cases and regulatory frameworks.',
			price: 12500,
			author: 'Prof. James Gatungu',
			Image: [{ url: '/coat-of-arms.jpg' }]
		},
		{
			id: 1003,
			name: 'Environmental Law & Climate Policy Framework',
			description: 'Comprehensive guide to environmental legislation and climate change policies.',
			price: 18000,
			author: 'Dr. Wanjiku Kabira',
			Image: [{ url: '/coat-of-arms.jpg' }]
		},
		{
			id: 1004,
			name: 'Tax Law Practice Manual 2024',
			description: 'Detailed analysis of Kenya Revenue Authority regulations and tax planning strategies.',
			price: 14000,
			author: 'CPA Joseph Kinyua',
			Image: [{ url: '/coat-of-arms.jpg' }]
		},
		{
			id: 1005,
			name: 'International Trade Law & WTO Agreements',
			description: 'Comprehensive analysis of international trade law and WTO agreements.',
			price: 16500,
			author: 'Prof. Mary Ndungu',
			Image: [{ url: '/coat-of-arms.jpg' }]
		},
		{
			id: 1006,
			name: 'Digital Privacy & Data Protection Laws',
			description: 'Essential guide to Kenya\'s Data Protection Act and GDPR compliance.',
			price: 13500,
			author: 'Advocate Grace Mutungu',
			Image: [{ url: '/coat-of-arms.jpg' }]
		}
	];
}
