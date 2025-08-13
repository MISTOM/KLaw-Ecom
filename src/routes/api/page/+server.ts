import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import { stat, readFile } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import prisma from '$lib/server/prisma';

// Simple in-memory rate limit (per-IP). For production use rate-limiter-flexible with redis.
const bucket = new Map<string, { count: number; reset: number }>();
const MAX_REQ = 20; // window burst
const WINDOW_MS = 10_000; // 10 seconds

function limit(ip: string) {
	const now = Date.now();
	const b = bucket.get(ip);
	if (!b || b.reset < now) {
		bucket.set(ip, { count: 1, reset: now + WINDOW_MS });
		return;
	}
	if (b.count >= MAX_REQ) throw error(429, 'Too many requests');
	b.count++;
}

export const GET: RequestHandler = async ({ url, locals, request }) => {
	const user = locals.user as { id: number } | null;
	if (!user) throw error(401, 'Unauthorized');

	const xff = request.headers.get('x-forwarded-for');
	const ip =
		xff?.split(',')[0].trim() ||
		request.headers.get('cf-connecting-ip') ||
		'unknown';
	limit(ip);

	const docId = Number(url.searchParams.get('docId'));
	const page = Number(url.searchParams.get('page'));
	if (!docId || !page) throw error(400, 'docId and page required');

	// License in Authorization: Bearer <token>
	const auth = request.headers.get('authorization') || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
	if (!token) throw error(401, 'License required');

	const JWT_SECRET = process.env.JWT_SECRET;
	if (!JWT_SECRET) throw error(500, 'JWT secret not configured');

	let payload: any;
	try {
		payload = jwt.verify(token, JWT_SECRET);
	} catch {
		throw error(401, 'Invalid or expired license');
	}

	if (payload.docId !== docId) throw error(403, 'License does not permit this document');
	const range = payload.pages as { from: number; to: number };
	if (!range || page < range.from || page > range.to) throw error(403, 'Page not permitted');

	// Ensure user is entitled (defense-in-depth)
	const entitlement = await prisma.entitlement.findFirst({ where: { userId: user.id, documentId: docId } });
	if (!entitlement) throw error(403, 'Forbidden');
	if (entitlement.expiresAt && entitlement.expiresAt < new Date()) throw error(403, 'Entitlement expired');

	const filePath = path.join(process.cwd(), 'secure_docs', String(docId), `${page}.enc`);
	try {
		await stat(filePath);
	} catch {
		throw error(404, 'Page not found');
	}

	// Log access (minimal PII)
	const ua = request.headers.get('user-agent')?.slice(0, 180) || null;
	void prisma.docAccessLog
		.create({
			data: { userId: user.id, documentId: docId, page, ip: ip.slice(0, 64), userAgent: ua || null }
		})
		.catch(() => {});

	const data = await readFile(filePath);
	return new Response(new Uint8Array(data), {
		status: 200,
		headers: {
			'Content-Type': 'application/octet-stream',
			'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
		}
	});
};
