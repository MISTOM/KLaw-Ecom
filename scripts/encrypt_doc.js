#!/usr/bin/env ts-node
/**
 * Document Encryption Script (Iteration 1)
 * Purpose: Split an input PDF into page images (optional pre-split), encrypt each page with a single per-document AES-256-GCM key.
 * The per-document key is wrapped (encrypted) with APP_MASTER_KEY and stored in the Document row.
 *
 * Page file format written to ./secure_docs/<docId>/<page>.enc:
 * [16-byte IV][16-byte AUTH_TAG][ciphertext]
 *
 * Security Notes:
 * - APP_MASTER_KEY must be 32 bytes (hex/base64 accepted). It's used only to wrap the random content key.
 * - Wrapped key stored as base64: wrapIV(12 or 16) || wrapAuthTag(16) || wrapCiphertext.
 * - AES-GCM chosen for integrity; no reuse of IV per page.
 * - For a production system consider: hardware KMS for master key, per-page keys, and integrity metadata versioning.
 */
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// We prefer system Poppler tools on Linux (pdftoppm/pdfinfo) to convert/count pages.
import { execFile as _execFile, spawnSync } from 'child_process';
import { promisify } from 'util';
const execFile = promisify(_execFile);
function parseArgs() {
	const args = process.argv.slice(2);
	const out = {};
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a.startsWith('--')) {
			const [k, v] = a.replace(/^--/, '').split('=');
			out[k] = v === undefined ? true : v;
		}
	}
	// Normalize flags
	if (out['dry-run'] !== undefined && out['dryRun'] === undefined) out['dryRun'] = out['dry-run'];
	if (typeof out['dryRun'] === 'string') out['dryRun'] = out['dryRun'] === 'true' || out['dryRun'] === '';
	if (!out.title) throw new Error('--title is required');
	if (!out.input) throw new Error('--input is required (PDF file or directory of images)');
	return out;
}
function loadMasterKey() {
	const raw = process.env.APP_MASTER_KEY;
	if (!raw) throw new Error('APP_MASTER_KEY missing');
	// Accept hex (64 chars) or base64; fallback raw utf8 (NOT recommended) for dev.
	if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
	try {
		const b = Buffer.from(raw, 'base64');
		if (b.length === 32) return b;
	} catch (_) {}
	if (raw.length === 32) return Buffer.from(raw, 'utf8');
	throw new Error('APP_MASTER_KEY must be 32 bytes (hex/base64/utf8)');
}
function commandExists(cmd) {
	const res = spawnSync(cmd, ['-v'], { stdio: 'ignore' });
	if (res.status === 0) return true;
	const res2 = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
	return res2.status === 0;
}
async function pdfToImages(pdfPath, workDir) {
	if (!commandExists('pdftoppm')) {
		throw new Error(
			'pdftoppm not found. Install poppler-utils (e.g., sudo apt-get install -y poppler-utils) or provide pre-split images.'
		);
	}
	await mkdir(workDir, { recursive: true });
	const outPrefix = path.join(workDir, 'page');
	await execFile('pdftoppm', ['-png', '-r', '150', pdfPath, outPrefix]);
	const files = (await readdir(workDir))
		.filter((f) => /^page-\d+\.png$/.test(f))
		.sort((a, b) => {
			const na = parseInt(a.split('-')[1]);
			const nb = parseInt(b.split('-')[1]);
			return na - nb;
		});
	if (!files.length) throw new Error('No pages generated from PDF');
	return files.map((f) => path.join(workDir, f));
}
async function pdfPageCount(pdfPath) {
	if (!commandExists('pdfinfo')) return null;
	try {
		const { stdout } = await execFile('pdfinfo', [pdfPath]);
		const m = stdout.split('\n').find((l) => l.startsWith('Pages:'));
		if (!m) return null;
		const n = parseInt(m.replace(/[^0-9]/g, ''));
		return isNaN(n) ? null : n;
	} catch {
		return null;
	}
}
async function collectImages(input, pagesPattern = '.png') {
	const statFiles = await readdir(input).catch(() => []);
	if (statFiles.length) {
		// treat as directory of images
		return statFiles
			.filter((f) => f.endsWith(pagesPattern))
			.sort((a, b) => a.localeCompare(b))
			.map((f) => path.join(input, f));
	}
	throw new Error('Input directory not found or empty for images');
}
function encryptContentKey(masterKey, contentKey) {
	// Reason: Wrap content key so DB never sees plaintext key.
	const iv = crypto.randomBytes(12); // 96-bit recommended for AES-GCM
	const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
	const ct = Buffer.concat([cipher.update(contentKey), cipher.final()]);
	const tag = cipher.getAuthTag();
	return Buffer.concat([iv, tag, ct]).toString('base64');
}
function decryptWrappedKey(masterKey, wrapped) {
	const data = Buffer.from(wrapped, 'base64');
	const iv = data.subarray(0, 12);
	const tag = data.subarray(12, 28);
	const ct = data.subarray(28);
	const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(ct), decipher.final()]);
}
function encryptPage(contentKey, pageBytes) {
	const iv = crypto.randomBytes(16); // use 128-bit iv distinct per page
	const cipher = crypto.createCipheriv('aes-256-gcm', contentKey, iv);
	const ciphertext = Buffer.concat([cipher.update(pageBytes), cipher.final()]);
	const tag = cipher.getAuthTag();
	return Buffer.concat([iv, tag, ciphertext]);
}
async function main() {
	const args = parseArgs();
	const masterKey = loadMasterKey();
	const inputPath = path.resolve(args.input);
	const isPdf = inputPath.toLowerCase().endsWith('.pdf');
	let pageImagePaths = [];
	const tempDir = path.join(process.cwd(), '.doc_work', crypto.randomUUID());
	if (isPdf) {
		if (args.dryRun) {
			const count = await pdfPageCount(inputPath);
			if (count != null) {
				console.log(`[DryRun] Would process ${count} pages.`);
			} else {
				console.log(
					'[DryRun] pdfinfo not available. Install poppler-utils to count pages, or proceed without count.'
				);
			}
			return;
		}
		console.log('Converting PDF to images using pdftoppm...');
		pageImagePaths = await pdfToImages(inputPath, tempDir);
	} else if (existsSync(inputPath)) {
		console.log('Using pre-split images directory...');
		pageImagePaths = await collectImages(inputPath, '.png');
		if (args.dryRun) {
			console.log(`[DryRun] Would process ${pageImagePaths.length} pages.`);
			return;
		}
	} else {
		throw new Error('Input not found');
	}
	const pageCount = pageImagePaths.length;
	const contentKey = crypto.randomBytes(32); // 256-bit content key
	const wrappedKey = encryptContentKey(masterKey, contentKey);
	// Insert Document row
	const doc = await prisma.document.create({
		data: {
			title: args.title,
			pageCount,
			wrappedKey
		}
	});
	const outDir = path.join(process.cwd(), 'secure_docs', String(doc.id));
	await mkdir(outDir, { recursive: true });
	console.log(`Encrypting ${pageCount} pages -> ${outDir}`);
	for (let i = 0; i < pageCount; i++) {
		const imgPath = pageImagePaths[i];
		const raw = await readFile(imgPath);
		const encrypted = encryptPage(contentKey, raw);
		const target = path.join(outDir, `${i + 1}.enc`);
		await writeFile(target, encrypted);
		process.stdout.write(`Page ${i + 1}/${pageCount} done\r`);
	}
	console.log('\nComplete. Document ID:', doc.id);
	// Verification sample (not stored) to assert wrap correctness in logs only.
	const unwrapped = decryptWrappedKey(masterKey, wrappedKey);
	if (!unwrapped.equals(contentKey)) throw new Error('Wrapped key verification failed');
	console.log('Wrapped key integrity verified.');
}
if (import.meta.url === `file://${process.argv[1]}`) {
	main()
		.catch((e) => {
			console.error('Error:', e.message || e);
			return prisma.$disconnect().finally(() => process.exit(1));
		})
		.then(() => prisma.$disconnect());
}
