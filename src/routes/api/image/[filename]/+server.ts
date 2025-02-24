import { readFile } from 'fs/promises';
import { error } from '@sveltejs/kit';

export async function GET({ params }) {
	const { filename } = params;
	if (!filename) {
		throw error(400, 'Invalid or no file name');
	}
	// Get file extension
	const fileExt = filename.toLowerCase().split('.').pop();
	const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];

	if (!fileExt || !allowedTypes.includes(`.${fileExt}`)) {
		throw error(400, 'Invalid file type');
	}

	const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
	const filePath = `uploads/images/${filename}`;

	try {
		const fileBuffer = await readFile(filePath);
		return new Response(fileBuffer, {
			headers: { 'Content-Type': contentType }
		});
	} catch (e) {
		throw error(404, 'Image not found');
	}
}
