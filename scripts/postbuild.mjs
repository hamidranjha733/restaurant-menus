/**
 * Runs after `next build` (static export to /out).
 *
 * The site is server-rendered HTML; it never needs React on the client. This step
 * removes Next.js's hydration scripts and their preload hints from every HTML file,
 * so the only script left is JSON-LD (data, not code) and anything marked data-keep.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
if (!fs.existsSync(OUT)) {
  console.error("postbuild: /out not found. Did `next build` run with output: 'export'?");
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
})(OUT);

let removedScripts = 0;
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs) => {
    if (/type=["']application\/ld\+json["']/i.test(attrs) || /\bdata-keep\b/i.test(attrs)) return match;
    removedScripts += 1;
    return "";
  });
  html = html.replace(/<link\b[^>]*rel=["'](?:preload|modulepreload)["'][^>]*as=["']script["'][^>]*\/?>/gi, "");
  html = html.replace(/<link\b[^>]*as=["']script["'][^>]*rel=["'](?:preload|modulepreload)["'][^>]*\/?>/gi, "");
  html = html.replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*\/?>/gi, "");
  // Next adds its own <meta name="robots" content="noindex"> to the 404 page; ours is
  // already there (noindex), so keep a single tag.
  const robotsTags = html.match(/<meta name="robots"[^>]*>/g) ?? [];
  if (robotsTags.length > 1) html = html.replace('<meta name="robots" content="noindex"/>', "");
  fs.writeFileSync(file, html);
}

// Client-navigation payloads are never requested once hydration is removed.
let removedPayloads = 0;
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full === path.join(OUT, "_next")) continue;
      walk(full);
    } else if (
      entry.name.endsWith(".txt") &&
      entry.name !== "robots.txt" &&
      // Keep public/ text files at the root (e.g. an IndexNow key file).
      !(dir === OUT && fs.existsSync(path.join(process.cwd(), "public", entry.name)))
    ) {
      fs.rmSync(full);
      removedPayloads += 1;
    }
  }
})(OUT);

// Next also writes the 404 page to /404/ and /_not-found/; only 404.html is needed.
for (const dir of ["404", "_not-found"]) fs.rmSync(path.join(OUT, dir), { recursive: true, force: true });

console.log(`postbuild: ${htmlFiles.length} HTML files, removed ${removedScripts} framework scripts and ${removedPayloads} RSC payload files.`);
