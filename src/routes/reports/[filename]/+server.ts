import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { filename } = params;

	// Validate filename to prevent directory traversal
	if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
		throw error(400, 'Invalid filename');
	}

	// Only allow PDF files
	if (!filename.endsWith('.pdf')) {
		throw error(400, 'Only PDF files are allowed');
	}

	const filePath = path.join(process.cwd(), 'static', 'reports', filename);

	try {
		// Check if file exists
		if (!fs.existsSync(filePath)) {
			throw error(404, 'Report not found');
		}

		// Read file
		const fileBuffer = fs.readFileSync(filePath);

		return new Response(fileBuffer, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `inline; filename="${filename}"`,
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (err) {
		console.error('Error serving report:', err);
		throw error(500, 'Error serving report');
	}
};
