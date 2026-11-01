import { formatDate } from "@/lib/seo";
import { guidePath } from "@/lib/guides";
import type { Guide } from "@/lib/types";

/** Grid of guide cards linking to each guide page. */
export function GuideList({ guides }: { guides: Guide[] }) {
  return (
    <ul className="brand-grid">
      {guides.map((g) => (
        <li key={g.slug}>
          <a href={guidePath(g.slug)} className="brand-card">
            <span className="brand-card-name">{g.seo.h1}</span>
            <span className="brand-card-meta">
              {g.brand} · Updated {formatDate(g.last_updated)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
