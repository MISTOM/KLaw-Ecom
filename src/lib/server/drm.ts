import crypto from 'crypto';

/**
 * Load the 32-byte APP_MASTER_KEY from env (hex, base64, or utf8 dev fallback).
 * Reason: Single source of truth for key parsing used across DRM endpoints.
 */
export function loadMasterKey(): Buffer {
	const raw = process.env.APP_MASTER_KEY;
	if (!raw) throw new Error('APP_MASTER_KEY missing');
	if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
	try {
		const b = Buffer.from(raw, 'base64');
		if (b.length === 32) return b;
	} catch {}
	if (raw.length === 32) return Buffer.from(raw, 'utf8');
	throw new Error('APP_MASTER_KEY must be 32 bytes (hex/base64/utf8)');
}

/**
 * Unwrap a document content key wrapped with APP_MASTER_KEY using AES-256-GCM.
 * Input format (base64): iv(12) || tag(16) || ciphertext
 */
export function unwrapDocumentKey(wrappedBase64: string, masterKey: Buffer): Buffer {
	const data = Buffer.from(wrappedBase64, 'base64');
	const iv = data.subarray(0, 12);
	const tag = data.subarray(12, 28);
	const ct = data.subarray(28);
	const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/**
 * Resolve license TTL from env with a secure default (60s for POC).
 */
export function getLicenseTTLSeconds(): number {
	const val = process.env.LICENSE_TTL_SECONDS;
	const n = val ? parseInt(val, 10) : NaN;
	return Number.isFinite(n) && n > 0 && n <= 3600 ? n : 60;
}
