import { brandPath } from "@/lib/brands";
import { formatDate } from "@/lib/seo";
import type { Brand } from "@/lib/types";

/** Grid of brand cards linking to each menu page. */
export function BrandList({ brands }: { brands: Brand[] }) {
  return (
    <ul className="brand-grid">
      {brands.map((b) => (
        <li key={b.slug}>
          <a href={brandPath(b.slug)} className="brand-card">
            <span className="brand-card-name">{b.brand} Menu</span>
            <span className="brand-card-meta">
              {b.site_category} · Updated {formatDate(b.last_updated)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
