import type { MetadataRoute } from "next";
import { INDEXING } from "@/site.config";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return INDEXING
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: absoluteUrl("/sitemap.xml") }
    : { rules: { userAgent: "*", disallow: "/" } };
}
