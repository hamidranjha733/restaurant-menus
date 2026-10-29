import { notFound } from "next/navigation";
import { MENU_BASE } from "@/site.config";
import { BrandList } from "@/components/BrandList";
import { Breadcrumbs, JsonLd } from "@/components/Layout";
import { brandPath, categoryPath, getActiveCategories } from "@/lib/brands";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

/** Only categories with at least one brand get a page. */
export function generateStaticParams() {
  return getActiveCategories().map(({ category }) => ({ slug: category.slug }));
}

const find = (slug: string) => getActiveCategories().find((c) => c.category.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const entry = find((await params).slug);
  if (!entry) return {};
  const { category } = entry;
  return pageMetadata({
    title: `${category.name} Menus With Prices`,
    description: category.description,
    path: categoryPath(category.slug),
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = find((await params).slug);
  if (!entry) notFound();
  const { category, brands } = entry;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Menus", path: `${MENU_BASE}/` },
    { name: category.name, path: categoryPath(category.slug) },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbJsonLd(crumbs),
            {
              "@type": "ItemList",
              name: `${category.name} menus`,
              itemListElement: brands.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: `${b.brand} Menu`, url: absoluteUrl(brandPath(b.slug)) })),
            },
          ],
        }}
      />
      <Breadcrumbs crumbs={crumbs} />
      <h1>{category.name} Menus With Prices</h1>
      <p className="lead">{category.description}</p>
      <BrandList brands={brands} />
    </>
  );
}
