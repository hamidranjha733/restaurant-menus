import type { Metadata } from "next";
import { DOMAIN, INDEXING, MENU_BASE, SITE_NAME } from "@/site.config";
import { brandPath, categoryPath, getCategory } from "./brands";
import { priceOffer } from "./price";
import type { Brand } from "./types";

export const robotsMeta: Metadata["robots"] = INDEXING ? { index: true, follow: true } : { index: false, follow: false };

export const absoluteUrl = (p: string) => `${DOMAIN}${p}`;

/** Per-page metadata: exact title (no suffix), description, canonical and Open Graph. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title, description, url: absoluteUrl(path), siteName: SITE_NAME, type: "website", locale: "en_US" },
    twitter: { card: "summary", title, description },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function brandCrumbs(brand: Brand): Crumb[] {
  const category = getCategory(brand.site_category);
  return [
    { name: "Home", path: "/" },
    { name: "Menus", path: `${MENU_BASE}/` },
    { name: category.name, path: categoryPath(category.slug) },
    { name: brand.brand, path: brandPath(brand.slug) },
  ];
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

/** Lowercase, with "pcs"/"pieces"/"ct"/"count" as "pc" and "fingers" as "finger", so "2 Pc", "2 ct" and "2 pieces" compare equal. */
const normalizeSize = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b(pcs?|pieces?|ct|count)\b/g, "pc")
    .replace(/\bfingers\b/g, "finger")
    .replace(/\s+/g, " ")
    .trim();

/**
 * "Hand-Cut Sirloin (6 oz)". The size is left off when the name already says it,
 * as in "2 Pc Signature Chicken" (2 pieces), "Buttermilk Pancakes (2)" (2 pancakes),
 * "Shake (Medium)" or "Gallon of Tea" (gallon).
 * Only a number-plus-unit or one-word size is matched loosely; a longer size such as
 * "Chicken & Shrimp" is left off only when the name already has it inside brackets,
 * e.g. "Cheese Pizza (Extra Large, 16")" with size "extra large".
 */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export function itemLabel(name: string, size: string): string {
  if (!size) return name;
  const loose = /^\d/.test(size) || !/\s/.test(size.trim());
  // "Buttermilk Pancakes (2)" or "Brownie (9 pc)" already gives the count in "2 pancakes" / "9 squares".
  const count = /^(\d+)\s/.exec(size)?.[1];
  const countInName = count !== undefined && new RegExp(`\\(${count}[)\\s]`).test(name);
  // "5 Chicken Fingerz Meal" or "Great 8 Boneless Wings Meal" already has the number and the unit.
  const countAndUnit = /^(\d+)\s+([a-z]+)$/i.exec(size.trim());
  const unitStem = countAndUnit && countAndUnit[2].length > 3 ? countAndUnit[2].toLowerCase().replace(/[sz]$/, "") : countAndUnit?.[2].toLowerCase();
  const numberAndUnitInName =
    countAndUnit !== null &&
    new RegExp(`(^|[^0-9])${countAndUnit[1]}($|[^0-9])`).test(name) &&
    new RegExp(`\\b${unitStem}`, "i").test(name);
  const sizeInName = loose
    ? new RegExp(`(^|[^a-z0-9])${escapeRe(normalizeSize(size))}($|[^a-z0-9])`).test(normalizeSize(name))
    : (name.match(/\([^)]*\)/g) ?? []).some((group) => new RegExp(`\\b${escapeRe(size.toLowerCase())}\\b`).test(group.toLowerCase()));
  // "2 Tenders" already gives the count in "2 pieces": a name that starts with the count needs no generic piece unit.
  const leadingCount =
    countAndUnit !== null && /^(pieces?|pcs?|ct|count)$/i.test(countAndUnit[2]) && new RegExp(`^${countAndUnit[1]}\\s`).test(name);
  const alreadyNamed = countInName || numberAndUnitInName || sizeInName || leadingCount;
  return alreadyNamed ? name : `${name} (${size})`;
}

/** "2250" -> "2,250" */
export const formatCalories = (calories: string) => Number(calories).toLocaleString("en-US");

/** "2026-10" -> "October 2026"; "2026-10-05" -> "October 5, 2026" */
export function formatDate(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d || 1));
  return date.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", year: "numeric", ...(d ? { day: "numeric" } : {}) });
}

/** Menu + FAQPage + BreadcrumbList for a brand page, as one @graph. */
export function brandJsonLd(brand: Brand) {
  const url = absoluteUrl(brandPath(brand.slug));
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: brand.seo.meta_title,
      description: brand.seo.meta_description,
      inLanguage: "en-US",
      dateModified: brand.last_updated,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${DOMAIN}/` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    { ...breadcrumbJsonLd(brandCrumbs(brand)), "@id": `${url}#breadcrumb` },
    {
      "@type": "Menu",
      "@id": `${url}#menu`,
      name: `${brand.brand} Menu`,
      url,
      inLanguage: "en-US",
      hasMenuSection: brand.menu.map((section) => ({
        "@type": "MenuSection",
        name: section.category,
        ...(section.note ? { description: section.note } : {}),
        hasMenuItem: section.items.map((item) => ({
          "@type": "MenuItem",
          name: itemLabel(item.name, item.size),
          ...(item.desc ? { description: item.desc } : {}),
          ...(priceOffer(item.price) ? { offers: priceOffer(item.price) } : {}),
          ...(item.calories ? { nutrition: { "@type": "NutritionInformation", calories: `${item.calories} calories` } } : {}),
        })),
      })),
    },
  ];
  if (brand.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: brand.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
