import { notFound } from "next/navigation";
import { AMAZON_ASSOCIATE_TAG } from "@/site.config";
import { BrandList } from "@/components/BrandList";
import { Breadcrumbs, JsonLd } from "@/components/Layout";
import { brandPath, categoryPath, getBrand, getBrands, getCategory, getRelatedBrands } from "@/lib/brands";
import { brandCrumbs, brandJsonLd, formatCalories, formatDate, pageMetadata, priceNumber } from "@/lib/seo";
import type { MenuSection } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const brand = getBrand((await params).slug);
  if (!brand) return {};
  return pageMetadata({ title: brand.seo.meta_title, description: brand.seo.meta_description, path: brandPath(brand.slug) });
}

/** "just-for-starters" from "Just For Starters" */
const sectionId = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function priceRange(section: MenuSection): string {
  const prices = section.items.map((i) => priceNumber(i.price));
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? `$${low.toFixed(2)}` : `$${low.toFixed(2)} - $${high.toFixed(2)}`;
}

const amazonSearchUrl = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}${AMAZON_ASSOCIATE_TAG ? `&tag=${encodeURIComponent(AMAZON_ASSOCIATE_TAG)}` : ""}`;

export default async function BrandMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const brand = getBrand((await params).slug);
  if (!brand) notFound();
  const category = getCategory(brand.site_category);
  const related = getRelatedBrands(brand);
  const updated = formatDate(brand.last_updated);

  return (
    <article className="brand-page">
      <JsonLd data={brandJsonLd(brand)} />
      <Breadcrumbs crumbs={brandCrumbs(brand)} />

      <header className="brand-header">
        <h1>{brand.seo.h1}</h1>
        <p className="meta">
          <a href={categoryPath(category.slug)}>{category.name}</a> · Last updated <time dateTime={brand.last_updated}>{updated}</time>
        </p>
      </header>

      {brand.quick_answer ? (
        <aside className="callout quick-answer" aria-label="Quick answer">
          <p className="callout-label">Quick answer</p>
          <p>{brand.quick_answer}</p>
        </aside>
      ) : null}

      <p className="lead">{brand.intro}</p>
      <p className="disclaimer" role="note">
        {brand.price_disclaimer}
      </p>

      {brand.hot_deal ? (
        <aside className="callout hot-deal" aria-label="Current deal">
          <p className="callout-label">Hot deal</p>
          <p>{brand.hot_deal}</p>
        </aside>
      ) : null}

      {brand.included_box ? (
        <section aria-labelledby="included">
          <h2 id="included">{brand.included_box.title}</h2>
          <div className="table-scroll">
            <table className="menu-table included-table">
              <tbody>
                {brand.included_box.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="at-a-glance">
        <h2 id="at-a-glance">{brand.brand} prices at a glance</h2>
        <div className="table-scroll">
          <table className="menu-table">
            <thead>
              <tr>
                <th scope="col">Menu section</th>
                <th scope="col">Items</th>
                <th scope="col">Price range</th>
              </tr>
            </thead>
            <tbody>
              {brand.menu.map((section) => (
                <tr key={section.category}>
                  <th scope="row">
                    <a href={`#${sectionId(section.category)}`}>{section.category}</a>
                  </th>
                  <td>{section.items.length}</td>
                  <td className="price">{priceRange(section)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {brand.popular_items?.length ? (
        <section aria-labelledby="popular">
          <h2 id="popular">Most popular at {brand.brand}</h2>
          <ul className="popular">
            {brand.popular_items.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {brand.menu.map((section) => {
        // The calories column appears only in sections that have at least one figure.
        const hasCalories = section.items.some((item) => item.calories);
        return (
          <section key={section.category} aria-labelledby={sectionId(section.category)}>
            <h2 id={sectionId(section.category)}>
              {brand.brand} {section.category} Prices
            </h2>
            {section.intro ? <p>{section.intro}</p> : null}
            {section.note ? <p className="section-note">{section.note}</p> : null}
            <div className="table-scroll">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Size</th>
                    {hasCalories ? (
                      <th scope="col" className="num">
                        Calories
                      </th>
                    ) : null}
                    <th scope="col" className="num">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, i) => (
                    <tr key={`${item.name}-${item.size}-${i}`}>
                      <th scope="row">{item.name}</th>
                      <td>{item.size || "-"}</td>
                      {hasCalories ? <td className="num">{item.calories ? formatCalories(item.calories) : "-"}</td> : null}
                      <td className="price">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {brand.make_at_home ? (
        <section aria-labelledby="make-at-home">
          <h2 id="make-at-home">{brand.make_at_home.title}</h2>
          {brand.make_at_home.intro ? <p>{brand.make_at_home.intro}</p> : null}
          {/* Affiliate disclosure sits above the links so readers see it before clicking. */}
          {AMAZON_ASSOCIATE_TAG ? <p className="small muted">As an Amazon Associate we earn from qualifying purchases.</p> : null}
          <ul className="product-grid">
            {brand.make_at_home.cards.map((card) => (
              <li key={card.name} className="product-card">
                <span className="product-card-name">{card.name}</span>
                <span className="product-card-blurb">{card.blurb}</span>
                <a href={amazonSearchUrl(card.amazon_search)} rel="sponsored nofollow noopener" target="_blank">
                  See options on Amazon
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {brand.faqs?.length ? (
        <section aria-labelledby="faq">
          <h2 id="faq">{brand.brand} menu FAQ</h2>
          <div className="faq">
            {brand.faqs.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section aria-labelledby="related">
          <h2 id="related">Similar restaurant menus</h2>
          <BrandList brands={related} />
        </section>
      ) : null}

      <p className="disclaimer small">
        {brand.price_disclaimer} {brand.brand} is a trademark of its owner. This page is an independent guide and is not affiliated with{" "}
        {brand.brand}.
      </p>
    </article>
  );
}
