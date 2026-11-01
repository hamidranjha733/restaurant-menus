import { notFound } from "next/navigation";
import { AMAZON_ASSOCIATE_TAG } from "@/site.config";
import { BrandList } from "@/components/BrandList";
import { GuideList } from "@/components/GuideList";
import { Breadcrumbs, JsonLd } from "@/components/Layout";
import { brandPath, categoryPath, getBrand, getBrands, getCategory, getRelatedBrands } from "@/lib/brands";
import { getGuidesForBrand } from "@/lib/guides";
import { sectionPriceRange } from "@/lib/price";
import { brandCrumbs, brandJsonLd, formatCalories, formatDate, itemLabel, pageMetadata } from "@/lib/seo";
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

const priceRange = (section: MenuSection) => sectionPriceRange(section.items.map((i) => i.price));

/** "Pexels (free license)" -> "Photo: Pexels (free license)"; a credit that already says "Photo" is kept as is. */
const photoCredit = (credit: string) => (/^photo\b/i.test(credit) ? credit : `Photo: ${credit}`);

const amazonSearchUrl = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}${AMAZON_ASSOCIATE_TAG ? `&tag=${encodeURIComponent(AMAZON_ASSOCIATE_TAG)}` : ""}`;

export default async function BrandMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const brand = getBrand((await params).slug);
  if (!brand) notFound();
  const category = getCategory(brand.site_category);
  const related = getRelatedBrands(brand);
  const guides = getGuidesForBrand(brand.slug);
  const updated = formatDate(brand.last_updated);

  return (
    <article className="brand-page">
      <JsonLd data={brandJsonLd(brand)} />
      {brand.hero_image ? (
        <figure className="hero-banner">
          <div className="hero-media">
            {/* Remote image loaded by the visitor's browser; plain <img> because the site is a static export. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.hero_image.url} alt={brand.hero_image.alt} width={1600} height={900} loading="eager" fetchPriority="high" decoding="async" />
            <header className="brand-header hero-overlay">
              <Breadcrumbs crumbs={brandCrumbs(brand)} />
              <h1>{brand.seo.h1}</h1>
              <p className="meta">
                <a href={categoryPath(category.slug)}>{category.name}</a> · Last updated{" "}
                <time dateTime={brand.last_updated}>{updated}</time>
              </p>
            </header>
          </div>
          {brand.hero_image.credit ? <figcaption className="hero-credit">{photoCredit(brand.hero_image.credit)}</figcaption> : null}
        </figure>
      ) : (
        <>
          <Breadcrumbs crumbs={brandCrumbs(brand)} />
          <header className="brand-header">
            <h1>{brand.seo.h1}</h1>
            <p className="meta">
              <a href={categoryPath(category.slug)}>{category.name}</a> · Last updated <time dateTime={brand.last_updated}>{updated}</time>
            </p>
          </header>
        </>
      )}

      {brand.highlights?.length ? (
        <ul className="highlights" aria-label="Highlights">
          {brand.highlights.map((h) => (
            <li key={`${h.strong}-${h.label}`}>
              <strong>{h.strong}</strong> <span>{h.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* One pill per menu section; the row scrolls sideways on narrow screens and sticks to the top. */}
      <nav className="jump-tabs" aria-label="Menu sections">
        <ul>
          {brand.menu.map((section) => (
            <li key={section.category}>
              <a href={`#${sectionId(section.category)}`}>{section.category}</a>
            </li>
          ))}
        </ul>
      </nav>

      {brand.hot_deal ? (
        <aside className="callout hot-deal" aria-label="Current deal">
          <p className="callout-label">Hot deal</p>
          <p>{brand.hot_deal}</p>
        </aside>
      ) : null}

      <p className="disclaimer small" role="note">
        {brand.price_disclaimer}
      </p>

      <section aria-labelledby="at-a-glance">
        <h2 id="at-a-glance">{brand.brand} Menu Prices at a Glance</h2>
        <p className="lead">{brand.intro}</p>
        {brand.quick_answer ? (
          <aside className="callout quick-answer" aria-label="Quick answer">
            <p className="callout-label">Quick answer</p>
            <p>{brand.quick_answer}</p>
          </aside>
        ) : null}
        <div className="table-scroll">
          <table className="menu-table">
            <caption className="table-caption">Price range by menu section</caption>
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

      {brand.menu.map((section) => {
        // No Size column: the size is folded into the item name. Calories get their own column only
        // when every item in the section has a figure; otherwise known calories go on the sub-line.
        const caloriesColumn = section.items.every((item) => item.calories);
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
                    {caloriesColumn ? (
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
                  {section.items.map((item, i) => {
                    // Skip the inline figure when the description already says it, e.g. "(about 15 cal)".
                    const calInDesc = !!item.calories && new RegExp(`\\b(${item.calories}|${formatCalories(item.calories)}) cal`).test(item.desc ?? "");
                    const subLine = [item.desc, !caloriesColumn && item.calories && !calInDesc ? `${formatCalories(item.calories)} cal` : ""]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <tr key={`${item.name}-${item.size}-${i}`}>
                        <th scope="row">
                          {itemLabel(item.name, item.size)}
                          {subLine ? <span className="item-desc">{subLine}</span> : null}
                        </th>
                        {caloriesColumn ? <td className="num">{formatCalories(item.calories!)}</td> : null}
                        <td className="price">{item.price}</td>
                      </tr>
                    );
                  })}
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
          <ul className="product-grid">
            {brand.make_at_home.cards.map((card) => (
              <li key={card.name} className="product-card">
                {card.icon ? (
                  <span className="product-card-icon" aria-hidden="true">
                    {card.icon}
                  </span>
                ) : null}
                <span className="product-card-name">{card.name}</span>
                <span className="product-card-blurb">{card.blurb}</span>
                <a className="cta-button" href={amazonSearchUrl(card.amazon_search)} rel="sponsored nofollow noopener" target="_blank">
                  Check price on Amazon →
                </a>
              </li>
            ))}
          </ul>
          {AMAZON_ASSOCIATE_TAG ? <p className="small muted disclosure-line">As an Amazon Associate we earn from qualifying purchases.</p> : null}
        </section>
      ) : null}

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

      {guides.length ? (
        <section aria-labelledby="guides">
          <h2 id="guides">{brand.brand} guides</h2>
          <GuideList guides={guides} />
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
