import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// e-citizen Notification url TODO: Implement this
export const GET: RequestHandler = async ({ request }) => {
	const data = await request.json();
	console.log('GET: Data from notification url: \n', data);
	return json({ success: true });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	console.log('POST: Data from notification url: \n', data);
	return json({ success: true });
};
