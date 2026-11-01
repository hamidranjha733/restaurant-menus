import type { MetadataRoute } from "next";
import { MENU_BASE } from "@/site.config";
import { brandPath, categoryPath, getActiveCategories, getBrands } from "@/lib/brands";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** "2026-10" -> "2026-10-01" so the sitemap always carries a full date. */
const fullDate = (d: string) => (d.length === 7 ? `${d}-01` : d);

export default function sitemap(): MetadataRoute.Sitemap {
  const brands = getBrands();
  const newest = brands.map((b) => fullDate(b.last_updated)).sort().at(-1);
  return [
    { url: absoluteUrl("/"), lastModified: newest },
    { url: absoluteUrl(`${MENU_BASE}/`), lastModified: newest },
    { url: absoluteUrl("/calorie-calculator/") },
    ...getActiveCategories().map(({ category, brands }) => ({
      url: absoluteUrl(categoryPath(category.slug)),
      lastModified: brands.map((b) => fullDate(b.last_updated)).sort().at(-1),
    })),
    ...brands.map((b) => ({ url: absoluteUrl(brandPath(b.slug)), lastModified: fullDate(b.last_updated) })),
  ];
}
