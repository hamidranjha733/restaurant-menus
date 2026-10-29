import { CONTACT_EMAIL, NAV, SITE_NAME, SITE_TAGLINE } from "@/site.config";
import type { Crumb } from "@/lib/seo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <a href="/" className="logo">
          {SITE_NAME}
        </a>
        <nav aria-label="Main">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>
          <strong>{SITE_NAME}</strong>: {SITE_TAGLINE}.
        </p>
        <p className="small">
          Not affiliated with, endorsed by or sponsored by any restaurant listed. Brand names belong to their owners. Prices are
          approximate and vary by location.
          {CONTACT_EMAIL ? (
            <>
              {" "}
              Spot a wrong price? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {crumbs.map((c, i) => (
          <li key={c.path}>{i === crumbs.length - 1 ? <span aria-current="page">{c.name}</span> : <a href={c.path}>{c.name}</a>}</li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: object }) {
  // "<" is escaped so a stray "</script>" in brand data can't end the block early.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
