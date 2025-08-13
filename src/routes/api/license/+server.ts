import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import prisma from '$lib/server/prisma';
import { getLicenseTTLSeconds, loadMasterKey, unwrapDocumentKey } from '$lib/server/drm';

/**
 * Issues a short-lived license JWT for an entitled user to view a document.
 * Body: { docId: number }
 * Response: { license: string, exp: number }
 *
 * Security (POC): embeds the raw AES key encrypted inside the JWT subject to short TTL.
 * For production, prefer ephemeral key exchange or server-side session-bound key retrieval.
 */
async function issueLicense(userId: number, docId: number) {
	// Check entitlement
	const entitlement = await prisma.entitlement.findFirst({ where: { userId, documentId: docId } });
	if (!entitlement) throw error(403, 'Forbidden');
	if (entitlement.expiresAt && entitlement.expiresAt < new Date()) throw error(403, 'Entitlement expired');

	const doc = await prisma.document.findUnique({ where: { id: docId } });
	if (!doc) throw error(404, 'Document not found');

	const masterKey = loadMasterKey();
	const contentKey = unwrapDocumentKey(doc.wrappedKey, masterKey);

	const ttl = getLicenseTTLSeconds();
	const exp = Math.floor(Date.now() / 1000) + ttl;
	const JWT_SECRET = process.env.JWT_SECRET;
	if (!JWT_SECRET) throw error(500, 'JWT secret not configured');

	const keyB64 = contentKey.toString('base64');
	const pages = { from: 1, to: doc.pageCount } as const;
	const license = jwt.sign({ sub: `doc:${docId}`, docId, key: keyB64, pages }, JWT_SECRET, {
		algorithm: 'HS256',
		expiresIn: ttl
	});
	// POC: also return key and pages explicitly so the client can initialize without decoding JWT
	return { license, exp, key: keyB64, pages };
}

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user as { id: number } | null;
	if (!user) throw error(401, 'Unauthorized');
	const { docId } = await request.json().catch(() => ({}));
	if (!docId || typeof docId !== 'number') throw error(400, 'docId required');
	const res = await issueLicense(user.id, docId);
	return json(res);
};

export const GET: RequestHandler = async ({ locals, url }) => {
	const user = locals.user as { id: number } | null;
	if (!user) throw error(401, 'Unauthorized');
	const docId = Number(url.searchParams.get('docId'));
	if (!docId) throw error(400, 'docId required');
	const res = await issueLicense(user.id, docId);
	return json(res);
};
