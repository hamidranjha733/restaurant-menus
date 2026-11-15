import type { Metadata } from "next";
import { Breadcrumbs, JsonLd } from "@/components/Layout";
import { INFO_PAGES, getInfoPage, infoPath } from "@/lib/info-pages";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/site.config";

/** About, How We Check Prices and the policy pages, one static page each at /<slug>/. */
export const dynamicParams = false;

export function generateStaticParams() {
  return INFO_PAGES.map((p) => ({ info: p.slug }));
}

type Props = { params: Promise<{ info: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getInfoPage((await params).info);
  return pageMetadata({ title: `${page.title} | ${SITE_NAME}`, description: page.description, path: infoPath(page.slug) });
}

const longDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export default async function InfoPageRoute({ params }: Props) {
  const page = getInfoPage((await params).info);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: page.h1, path: infoPath(page.slug) },
  ];
  const type = page.slug === "about" ? "AboutPage" : page.slug === "contact" ? "ContactPage" : "WebPage";
  return (
    <article className="info-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": type,
              name: page.h1,
              description: page.description,
              url: absoluteUrl(infoPath(page.slug)),
              dateModified: page.updated,
              isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
            },
            breadcrumbJsonLd(crumbs),
          ],
        }}
      />
      <Breadcrumbs crumbs={crumbs} />
      <h1>{page.h1}</h1>
      <p className="meta small">
        Last updated <time dateTime={page.updated}>{longDate(page.updated)}</time>
      </p>
      {page.sections.map((s, i) => (
        <section key={i}>
          {s.heading ? <h2>{s.heading}</h2> : null}
          {s.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
          {s.list ? (
            <ul>
              {s.list.map((li, j) => (
                <li key={j}>{li}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
