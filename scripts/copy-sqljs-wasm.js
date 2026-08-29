const fs = require('fs');
const path = require('path');

// sql.js's package.json "exports" map picks dist/sql-wasm-browser.js for bundler/browser
// builds (webpack respects the "browser" condition for `import 'sql.js'`), and that build's
// default locateFile filename is "sql-wasm-browser.wasm" — not "sql-wasm.wasm" (the Node build's
// filename, used by scripts/generate-db.js). Both must be present under public/ for their
// respective consumers (browser client code vs. this Node script).
const DIST_DIR = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist');
const DEST_DIR = path.join(__dirname, '..', 'public');
const FILES = ['sql-wasm.wasm', 'sql-wasm-browser.wasm'];

fs.mkdirSync(DEST_DIR, { recursive: true });
for (const file of FILES) {
  const src = path.join(DIST_DIR, file);
  if (!fs.existsSync(src)) {
    console.warn(`sql.js wasm binary not found at ${src}, skipping copy.`);
    continue;
  }
  const dest = path.join(DEST_DIR, file);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}
