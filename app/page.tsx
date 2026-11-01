import { MENU_BASE, SITE_NAME, SITE_TAGLINE } from "@/site.config";
import { BrandList } from "@/components/BrandList";
import { CalorieCalculator } from "@/components/CalorieCalculator";
import { JsonLd } from "@/components/Layout";
import { categoryPath, getActiveCategories, getBrands } from "@/lib/brands";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

const TITLE = `${SITE_NAME}: Restaurant Menus With Prices`;
const DESCRIPTION = "Full menus with prices for popular US restaurant and fast food chains, sorted by category and checked regularly.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/" });

export default function HomePage() {
  const brands = getBrands();
  const recent = [...brands].sort((a, b) => b.last_updated.localeCompare(a.last_updated)).slice(0, 12);
  const categories = getActiveCategories();

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") }} />
      <section className="hero">
        <h1>Restaurant Menus With Prices</h1>
        <p className="lead">
          {SITE_TAGLINE}. Every menu is broken down by category with typical prices, so you know roughly what you will pay before you
          go.
        </p>
        <p>
          <a className="button" href={`${MENU_BASE}/`}>
            Browse all {brands.length} menus
          </a>
        </p>
      </section>

      <section>
        <h2>Browse by category</h2>
        <ul className="category-grid">
          {categories.map(({ category, brands }) => (
            <li key={category.slug}>
              <a href={categoryPath(category.slug)} className="category-card">
                <span className="category-card-name">{category.name}</span>
                <span className="category-card-meta">
                  {brands.length} {brands.length === 1 ? "menu" : "menus"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Recently updated menus</h2>
        <BrandList brands={recent} />
      </section>

      <CalorieCalculator />
    </>
  );
}
