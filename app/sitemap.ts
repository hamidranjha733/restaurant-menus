import type { MetadataRoute } from "next";
import { MENU_BASE } from "@/site.config";
import { brandPath, categoryPath, getActiveCategories, getBrands } from "@/lib/brands";
import { GUIDES_BASE, getGuides, guidePath } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** "2026-10" -> "2026-10-01" so the sitemap always carries a full date. */
const fullDate = (d: string) => (d.length === 7 ? `${d}-01` : d);

export default function sitemap(): MetadataRoute.Sitemap {
  const brands = getBrands();
  const guides = getGuides();
  const newest = brands.map((b) => fullDate(b.last_updated)).sort().at(-1);
  return [
    { url: absoluteUrl("/"), lastModified: newest },
    { url: absoluteUrl(`${MENU_BASE}/`), lastModified: newest },
    ...getActiveCategories().map(({ category, brands }) => ({
      url: absoluteUrl(categoryPath(category.slug)),
      lastModified: brands.map((b) => fullDate(b.last_updated)).sort().at(-1),
    })),
    ...brands.map((b) => ({ url: absoluteUrl(brandPath(b.slug)), lastModified: fullDate(b.last_updated) })),
    ...(guides.length ? [{ url: absoluteUrl(`${GUIDES_BASE}/`), lastModified: guides.map((g) => fullDate(g.last_updated)).sort().at(-1) }] : []),
    ...guides.map((g) => ({ url: absoluteUrl(guidePath(g.slug)), lastModified: fullDate(g.last_updated) })),
  ];
}
