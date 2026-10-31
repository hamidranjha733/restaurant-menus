import fs from "node:fs";
import path from "node:path";
import { MENU_BASE } from "@/site.config";
import categoriesJson from "@/data/categories.json";
import type { Brand, Category } from "./types";

const BRANDS_DIR = path.join(process.cwd(), "data", "brands");

export const CATEGORIES: Category[] = categoriesJson;

const PRICE_RE = /^\$\d{1,4}(\.\d{2})?$/;
const CALORIES_RE = /^\d{1,5}$/;
const DATE_RE =/^\d{4}-\d{2}(-\d{2})?$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Checks a brand file and returns every problem found. The build fails on any of them,
 * so a typo in one of the 62 brand files never ships as a broken page.
 */
function validate(b: Brand, file: string): string[] {
  const errors: string[] = [];
  const need = (ok: unknown, msg: string) => {
    if (!ok) errors.push(msg);
  };
  need(typeof b.slug === "string" && SLUG_RE.test(b.slug), "slug must be lowercase-kebab-case");
  need(`${b.slug}.json` === path.basename(file), `file name must be ${b.slug}.json`);
  need(b.brand, "brand is required");
  need(CATEGORIES.some((c) => c.name === b.site_category), `site_category "${b.site_category}" is not in data/categories.json`);
  if (b.url_path) need(b.url_path === `${MENU_BASE}/${b.slug}/`, `url_path must be ${MENU_BASE}/${b.slug}/`);
  need(b.seo?.meta_title && b.seo.meta_title.length <= 60, `seo.meta_title must be 1-60 chars (is ${b.seo?.meta_title?.length ?? 0})`);
  need(
    b.seo?.meta_description && b.seo.meta_description.length <= 160,
    `seo.meta_description must be 1-160 chars (is ${b.seo?.meta_description?.length ?? 0})`,
  );
  need(b.seo?.h1, "seo.h1 is required");
  need(DATE_RE.test(b.last_updated ?? ""), "last_updated must be YYYY-MM or YYYY-MM-DD");
  need(b.price_disclaimer, "price_disclaimer is required");
  need(b.intro, "intro is required");
  need(Array.isArray(b.menu) && b.menu.length > 0, "menu must have at least one category");
  for (const section of b.menu ?? []) {
    need(section.category, "every menu section needs a category");
    need(section.items?.length > 0, `menu section "${section.category}" has no items`);
    for (const item of section.items ?? []) {
      need(item.name, `an item in "${section.category}" has no name`);
      need(typeof item.size === "string", `"${item.name}" needs a size ("" if none)`);
      need(PRICE_RE.test(item.price ?? ""), `"${item.name}" price "${item.price}" must look like $12.99`);
      need(!item.calories || CALORIES_RE.test(item.calories), `"${item.name}" calories "${item.calories}" must be digits only, or ""`);
      need(item.desc === undefined || typeof item.desc === "string", `"${item.name}" desc must be text`);
    }
  }
  for (const faq of b.faqs ?? []) need(faq.q && faq.a, "every FAQ needs q and a");
  if (b.included_box) {
    need(b.included_box.title && b.included_box.rows?.length, "included_box needs a title and at least one row");
    for (const row of b.included_box.rows ?? []) need(row.label && row.detail, "every included_box row needs label and detail");
  }
  if (b.hero_image) {
    need(/^https:\/\/\S+$/.test(b.hero_image.url ?? ""), "hero_image.url must start with https://");
    need(b.hero_image.alt, "hero_image.alt is required");
  }
  if (b.make_at_home) {
    need(b.make_at_home.title && b.make_at_home.cards?.length, "make_at_home needs a title and at least one card");
    for (const card of b.make_at_home.cards ?? []) need(card.name && card.blurb && card.amazon_search, "every make_at_home card needs name, blurb and amazon_search");
  }
  return errors;
}

let cache: Brand[] | null = null;

/** All brands, A–Z by name. Reads and validates data/brands/*.json once per build. */
export function getBrands(): Brand[] {
  if (cache) return cache;
  const files = fs.existsSync(BRANDS_DIR) ? fs.readdirSync(BRANDS_DIR).filter((f) => f.endsWith(".json")) : [];
  const problems: string[] = [];
  const brands = files.map((f) => {
    const file = path.join(BRANDS_DIR, f);
    let b: Brand;
    try {
      b = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
      problems.push(`${f}: invalid JSON (${(e as Error).message})`);
      return null;
    }
    problems.push(...validate(b, file).map((msg) => `${f}: ${msg}`));
    return b;
  });
  if (problems.length) throw new Error(`Brand data errors:\n  ${problems.join("\n  ")}`);
  cache = (brands as Brand[]).sort((a, b) => a.brand.localeCompare(b.brand));
  return cache;
}

export function getBrand(slug: string): Brand | undefined {
  return getBrands().find((b) => b.slug === slug);
}

export function getCategory(name: string): Category {
  return CATEGORIES.find((c) => c.name === name)!;
}

/** Categories that have at least one brand, in data/categories.json order. */
export function getActiveCategories(): { category: Category; brands: Brand[] }[] {
  const brands = getBrands();
  return CATEGORIES.map((category) => ({ category, brands: brands.filter((b) => b.site_category === category.name) })).filter(
    (c) => c.brands.length > 0,
  );
}

/**
 * Brands to link from a brand page: its internal_links that exist, topped up with
 * others from the same category so the section is never empty once two brands share one.
 */
export function getRelatedBrands(brand: Brand, limit = 6): Brand[] {
  const linked = (brand.internal_links ?? []).map(getBrand).filter((b): b is Brand => !!b && b.slug !== brand.slug);
  const sameCategory = getBrands().filter((b) => b.site_category === brand.site_category && b.slug !== brand.slug && !linked.includes(b));
  return [...linked, ...sameCategory].slice(0, limit);
}

export const brandPath = (slug: string) => `${MENU_BASE}/${slug}/`;
export const categoryPath = (slug: string) => `/category/${slug}/`;
