import { notFound } from "next/navigation";
import { SITE_NAME, DOMAIN } from "@/site.config";
import { Breadcrumbs, JsonLd } from "@/components/Layout";
import { GuideList } from "@/components/GuideList";
import { brandPath, getBrand } from "@/lib/brands";
import { GUIDES_BASE, getGuide, getGuides, guidePath, resolveGuideLinks } from "@/lib/guides";
import { absoluteUrl, breadcrumbJsonLd, formatDate, pageMetadata } from "@/lib/seo";
import type { Guide } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return pageMetadata({ title: guide.seo.meta_title, description: guide.seo.meta_description, path: guidePath(guide.slug) });
}

const crumbsFor = (g: Guide) => [
  { name: "Home", path: "/" },
  { name: "Guides", path: `${GUIDES_BASE}/` },
  { name: g.seo.h1, path: guidePath(g.slug) },
];

/** "Pexels (free license)" -> "Photo: Pexels (free license)"; a credit that already says "Photo" is kept as is. */
const photoCredit = (credit: string) => (/^photo\b/i.test(credit) ? credit : `Photo: ${credit}`);

function guideJsonLd(g: Guide) {
  const url = absoluteUrl(guidePath(g.slug));
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: g.seo.h1,
      description: g.seo.meta_description,
      url,
      inLanguage: "en-US",
      dateModified: g.last_updated,
      author: { "@type": "Organization", name: g.byline },
      publisher: { "@type": "Organization", name: SITE_NAME, url: `${DOMAIN}/` },
      about: { "@type": "Organization", name: g.brand },
      ...(g.brand_slug ? { mentions: { "@type": "WebPage", url: absoluteUrl(brandPath(g.brand_slug)) } } : {}),
    },
    { ...breadcrumbJsonLd(crumbsFor(g)), "@id": `${url}#breadcrumb` },
  ];
  if (g.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const brand = guide.brand_slug ? getBrand(guide.brand_slug) : undefined;
  const hero = brand?.hero_image;
  const links = resolveGuideLinks(guide);
  const more = getGuides()
    .filter((g) => g.slug !== guide.slug && !links.some((l) => l.href === guidePath(g.slug)))
    .slice(0, 4);
  const crumbs = crumbsFor(guide);
  const meta = (
    <p className="meta">
      <span className="guide-eyebrow">{guide.category}</span> · By {guide.byline} · Updated{" "}
      <time dateTime={guide.last_updated}>{formatDate(guide.last_updated)}</time>
    </p>
  );

  return (
    <article className="brand-page guide-page">
      <JsonLd data={guideJsonLd(guide)} />
      {hero ? (
        <figure className="hero-banner">
          <div className="hero-media">
            {/* The brand's menu-page banner, loaded by the visitor's browser. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.url} alt={hero.alt} width={1600} height={900} loading="eager" fetchPriority="high" decoding="async" />
            <header className="brand-header hero-overlay">
              <Breadcrumbs crumbs={crumbs} />
              <h1>{guide.seo.h1}</h1>
              {meta}
            </header>
          </div>
          {hero.credit ? <figcaption className="hero-credit">{photoCredit(hero.credit)}</figcaption> : null}
        </figure>
      ) : (
        <>
          <Breadcrumbs crumbs={crumbs} />
          <header className="brand-header guide-header">
            <h1>{guide.seo.h1}</h1>
            {meta}
          </header>
        </>
      )}

      <aside className="callout quick-answer" aria-label="Quick answer">
        <p className="callout-label">Quick answer</p>
        <p>{guide.quick_answer}</p>
      </aside>

      {guide.key_facts?.length ? (
        <section aria-labelledby="key-facts">
          <h2 id="key-facts">Key facts</h2>
          <ul className="key-facts">
            {guide.key_facts.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {guide.body.map((s, i) => (
        <section key={s.heading} aria-labelledby={`part-${i + 1}`}>
          <h2 id={`part-${i + 1}`}>{s.heading}</h2>
          <p>{s.text}</p>
        </section>
      ))}

      {guide.faqs?.length ? (
        <section aria-labelledby="faq">
          <h2 id="faq">Frequently asked questions</h2>
          <div className="faq">
            {guide.faqs.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {links.length ? (
        <section aria-labelledby="read-next">
          <h2 id="read-next">Read next</h2>
          <ul className="brand-grid">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="brand-card">
                  <span className="brand-card-name">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {more.length ? (
        <section aria-labelledby="more-guides">
          <h2 id="more-guides">More restaurant guides</h2>
          <GuideList guides={more} />
        </section>
      ) : null}

      <p className="disclaimer small">
        {guide.brand} is a trademark of its owner. This guide is independent and is not affiliated with {guide.brand}. Policies and prices
        can vary by location.
      </p>
    </article>
  );
}
