import fs from "node:fs";
import path from "node:path";
import { brandPath, getBrand } from "./brands";
import type { Guide } from "./types";

const GUIDES_DIR = path.join(process.cwd(), "data", "guides");
const DATE_RE = /^\d{4}-\d{2}(-\d{2})?$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const GUIDES_BASE = "/guides";
export const guidePath = (slug: string) => `${GUIDES_BASE}/${slug}/`;

/** Checks a guide file and returns every problem found; the build fails on any of them. */
function validate(g: Guide, file: string): string[] {
  const errors: string[] = [];
  const need = (ok: unknown, msg: string) => {
    if (!ok) errors.push(msg);
  };
  need(typeof g.slug === "string" && SLUG_RE.test(g.slug), "slug must be lowercase-kebab-case");
  need(`${g.slug}.json` === path.basename(file), `file name must be ${g.slug}.json`);
  need(g.type === "guide", 'type must be "guide"');
  need(g.category, "category is required");
  need(g.brand, "brand is required");
  need(typeof g.brand_slug === "string", 'brand_slug is required ("" if the brand has no menu page)');
  if (g.brand_slug) need(getBrand(g.brand_slug), `brand_slug "${g.brand_slug}" has no file in data/brands`);
  need(g.byline, "byline is required");
  need(DATE_RE.test(g.last_updated ?? ""), "last_updated must be YYYY-MM or YYYY-MM-DD");
  need(g.seo?.meta_title && g.seo.meta_title.length <= 60, `seo.meta_title must be 1-60 chars (is ${g.seo?.meta_title?.length ?? 0})`);
  need(
    g.seo?.meta_description && g.seo.meta_description.length <= 160,
    `seo.meta_description must be 1-160 chars (is ${g.seo?.meta_description?.length ?? 0})`,
  );
  need(g.seo?.h1, "seo.h1 is required");
  need(g.quick_answer, "quick_answer is required");
  need(Array.isArray(g.body) && g.body.length > 0, "body must have at least one section");
  for (const s of g.body ?? []) need(s.heading && s.text, "every body section needs heading and text");
  for (const f of g.faqs ?? []) need(f.q && f.a, "every FAQ needs q and a");
  for (const l of g.internal_links ?? []) need(l.label && l.slug && SLUG_RE.test(l.slug), "every internal link needs label and a kebab-case slug");
  if (g.key_facts !== undefined) need(Array.isArray(g.key_facts) && g.key_facts.every((k) => typeof k === "string" && k), "key_facts must be a list of text");
  return errors;
}

let cache: Guide[] | null = null;

/** All guides, newest first, then A–Z by title. Reads and validates data/guides/*.json once per build. */
export function getGuides(): Guide[] {
  if (cache) return cache;
  const files = fs.existsSync(GUIDES_DIR) ? fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".json")) : [];
  const problems: string[] = [];
  const guides = files.map((f) => {
    const file = path.join(GUIDES_DIR, f);
    let g: Guide;
    try {
      g = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
      problems.push(`${f}: invalid JSON (${(e as Error).message})`);
      return null;
    }
    problems.push(...validate(g, file).map((msg) => `${f}: ${msg}`));
    return g;
  });
  if (problems.length) throw new Error(`Guide data errors:\n  ${problems.join("\n  ")}`);
  cache = (guides as Guide[]).sort((a, b) => b.last_updated.localeCompare(a.last_updated) || a.seo.h1.localeCompare(b.seo.h1));
  return cache;
}

export function getGuide(slug: string): Guide | undefined {
  return getGuides().find((g) => g.slug === slug);
}

/** Guides about one brand, for its menu page. */
export function getGuidesForBrand(brandSlug: string): Guide[] {
  return getGuides().filter((g) => g.brand_slug === brandSlug);
}

/** A guide's internal_links that resolve to a menu page or another guide; the rest wait until their page exists. */
export function resolveGuideLinks(guide: Guide): { label: string; href: string }[] {
  return (guide.internal_links ?? []).flatMap((l) => {
    if (l.slug === guide.slug) return [];
    if (getBrand(l.slug)) return [{ label: l.label, href: brandPath(l.slug) }];
    if (getGuide(l.slug)) return [{ label: l.label, href: guidePath(l.slug) }];
    return [];
  });
}
