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

/** "Hand-Cut Sirloin (6 oz)". A name that already ends in "(6 oz)" is left as is. */
export const itemLabel = (name: string, size: string) =>
  size && !name.toLowerCase().includes(`(${size.toLowerCase()})`) ? `${name} (${size})` : name;

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
