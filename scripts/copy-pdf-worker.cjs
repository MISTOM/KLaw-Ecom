#!/usr/bin/env node
// Copies pdf.js worker file from pdfjs-dist to static for local serving
const fs = require('fs');
const path = require('path');

function log(msg) { console.log(`[pdfjs-worker] ${msg}`); }

try {
    const pkgRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
    const workerSrc = path.join(pkgRoot, 'build', 'pdf.worker.mjs');
    const mapSrc = workerSrc + '.map';
    if (!fs.existsSync(workerSrc)) {
        log('Worker source not found at ' + workerSrc);
        process.exit(0);
    }
    const destDir = path.join(process.cwd(), 'static');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const dest = path.join(destDir, 'pdf.worker.mjs');
    fs.copyFileSync(workerSrc, dest);
    log('Copied worker to ' + dest);

    // Copy source map if present to silence 404s like "Not found: /pdf.worker.mjs.map"
    if (fs.existsSync(mapSrc)) {
        const destMap = dest + '.map';
        fs.copyFileSync(mapSrc, destMap);
        log('Copied worker source map to ' + destMap);
    } else {
        log('Source map not found (optional)');
    }

    // Optional: generate gzip & brotli versions for prod serving (idempotent)
    try {
        const zlib = require('zlib');
        const workerBuf = fs.readFileSync(workerSrc);
        const gzPath = dest + '.gz';
        const brPath = dest + '.br';
        fs.writeFileSync(gzPath, zlib.gzipSync(workerBuf));
        fs.writeFileSync(brPath, zlib.brotliCompressSync(workerBuf));
        log('Generated compressed variants (.gz, .br)');
        if (fs.existsSync(mapSrc)) {
            const mapBuf = fs.readFileSync(mapSrc);
            fs.writeFileSync(gzPath + '.map', zlib.gzipSync(mapBuf));
            fs.writeFileSync(brPath + '.map', zlib.brotliCompressSync(mapBuf));
        }
    } catch (cErr) {
        log('Compression skipped: ' + cErr.message);
    }

    // Copy PDF.js viewer assets for enhanced viewer
    try {
        const webSrc = path.join(pkgRoot, 'web');
        const pdfjsDestDir = path.join(process.cwd(), 'static', 'pdfjs');

        if (fs.existsSync(webSrc)) {
            if (!fs.existsSync(pdfjsDestDir)) fs.mkdirSync(pdfjsDestDir, { recursive: true });

            // Copy CSS and essential viewer files
            const filesToCopy = ['pdf_viewer.css', 'viewer.css', 'viewer.mjs', 'viewer.js'];
            filesToCopy.forEach(file => {
                const srcFile = path.join(webSrc, file);
                if (fs.existsSync(srcFile)) {
                    const destFile = path.join(pdfjsDestDir, file);
                    fs.copyFileSync(srcFile, destFile);
                    log(`Copied ${file} to pdfjs/`);
                }
            });

            // Copy images directory if it exists
            const imagesSrc = path.join(webSrc, 'images');
            const imagesDest = path.join(pdfjsDestDir, 'images');
            if (fs.existsSync(imagesSrc)) {
                if (!fs.existsSync(imagesDest)) fs.mkdirSync(imagesDest, { recursive: true });
                const images = fs.readdirSync(imagesSrc);
                images.forEach(img => {
                    fs.copyFileSync(path.join(imagesSrc, img), path.join(imagesDest, img));
                });
                log(`Copied ${images.length} images to pdfjs/images/`);
            }
        }
    } catch (viewerErr) {
        log('PDF.js viewer assets copy skipped: ' + viewerErr.message);
    }
} catch (e) {
    log('Error copying worker: ' + e.message);
    process.exit(0);
}
