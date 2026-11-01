/**
 * Run after `npm run build`. Checks every page in /out and exits 1 on any error:
 * title and description present and within length, one canonical, valid JSON-LD,
 * no leftover framework scripts, and every internal link resolves to a page.
 * Also lists internal_links in brand files that point at brands not added yet.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const BRANDS = path.join(process.cwd(), "data", "brands");
if (!fs.existsSync(OUT)) {
  console.error("check: /out not found. Run `npm run build` first.");
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "_next") walk(full);
    } else if (entry.name.endsWith(".html")) pages.push(full);
  }
})(OUT);

const urlOf = (file) => {
  const rel = path.relative(OUT, file).split(path.sep).join("/");
  if (rel === "404.html") return "/404.html";
  return "/" + rel.replace(/index\.html$/, "");
};
const exists = (href) => {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean) return true;
  const target = path.join(OUT, decodeURIComponent(clean));
  return fs.existsSync(path.join(target, "index.html")) || (fs.existsSync(target) && fs.statSync(target).isFile());
};
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const errors = [];
for (const file of pages) {
  const url = urlOf(file);
  const html = fs.readFileSync(file, "utf8");
  const err = (msg) => errors.push(`${url}: ${msg}`);

  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
  if (!title) err("missing <title>");
  else if (title.length > 60) err(`title is ${title.length} chars (max 60): ${title}`);

  if (url === "/404.html") continue;

  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  if (!desc) err("missing meta description");
  else if (desc.length > 160) err(`meta description is ${desc.length} chars (max 160)`);

  const canonicals = html.match(/<link rel="canonical"[^>]*>/g) ?? [];
  if (canonicals.length !== 1) err(`expected 1 canonical, found ${canonicals.length}`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) err("expected exactly one <h1>");

  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bdata-keep\b/.test(attrs) && !/\bsrc=/.test(attrs)) continue; // page script kept on purpose (e.g. the homepage calorie calculator)
    if (!/application\/ld\+json/.test(attrs)) {
      err("framework script left in page (postbuild did not run?)");
      continue;
    }
    try {
      JSON.parse(body);
    } catch (e) {
      err(`invalid JSON-LD: ${e.message}`);
    }
  }

  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    if (!exists(href)) err(`broken link ${href}`);
  }
}

const brandSlugs = new Set(fs.readdirSync(BRANDS).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")));
const pending = new Map();
for (const slug of brandSlugs) {
  const data = JSON.parse(fs.readFileSync(path.join(BRANDS, `${slug}.json`), "utf8"));
  for (const link of data.internal_links ?? []) if (!brandSlugs.has(link)) pending.set(link, [...(pending.get(link) ?? []), slug]);
}

const GUIDES = path.join(process.cwd(), "data", "guides");
const guideSlugs = new Set(fs.existsSync(GUIDES) ? fs.readdirSync(GUIDES).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")) : []);
for (const slug of guideSlugs) {
  const data = JSON.parse(fs.readFileSync(path.join(GUIDES, `${slug}.json`), "utf8"));
  for (const { slug: link } of data.internal_links ?? [])
    if (!brandSlugs.has(link) && !guideSlugs.has(link)) pending.set(link, [...(pending.get(link) ?? []), `guide:${slug}`]);
}

console.log(`check: ${pages.length} pages, ${brandSlugs.size} brands, ${guideSlugs.size} guides.`);
if (pending.size) {
  console.log(`Waiting on ${pending.size} pages (brand menus or guides linked but not added yet; links appear once the JSON exists):`);
  for (const [slug, from] of pending) console.log(`  ${slug}  <- ${from.join(", ")}`);
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("check: OK");
