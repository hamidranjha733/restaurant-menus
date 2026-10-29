import { MENU_BASE } from "@/site.config";
import { BrandList } from "@/components/BrandList";
import { Breadcrumbs, JsonLd } from "@/components/Layout";
import { brandPath, categoryPath, getActiveCategories, getBrands } from "@/lib/brands";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const TITLE = "All Restaurant Menus With Prices (A-Z)";
const DESCRIPTION = "Every restaurant menu on the site, A to Z and by category. Each page lists items by section with typical US prices.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Menus", path: `${MENU_BASE}/` },
];

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `${MENU_BASE}/` });

export default function MenuHubPage() {
  const brands = getBrands();
  const byLetter = new Map<string, typeof brands>();
  for (const b of brands) {
    const letter = /[a-z]/i.test(b.brand[0]) ? b.brand[0].toUpperCase() : "#";
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), b]);
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbJsonLd(CRUMBS),
            {
              "@type": "ItemList",
              name: "Restaurant menus",
              itemListElement: brands.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: `${b.brand} Menu`, url: absoluteUrl(brandPath(b.slug)) })),
            },
          ],
        }}
      />
      <Breadcrumbs crumbs={CRUMBS} />
      <h1>All Restaurant Menus</h1>
      <p className="lead">
        {brands.length} restaurant {brands.length === 1 ? "menu" : "menus"} with prices. Pick a brand below, or browse by category.
      </p>

      {getActiveCategories().map(({ category, brands }) => (
        <section key={category.slug}>
          <h2 id={category.slug}>
            <a href={categoryPath(category.slug)}>{category.name}</a>
          </h2>
          <BrandList brands={brands} />
        </section>
      ))}

      <section>
        <h2 id="a-z">A-Z index</h2>
        <dl className="az">
          {[...byLetter].map(([letter, list]) => (
            <div key={letter}>
              <dt>{letter}</dt>
              <dd>
                {list.map((b, i) => (
                  <span key={b.slug}>
                    {i > 0 ? " · " : null}
                    <a href={brandPath(b.slug)}>{b.brand}</a>
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
