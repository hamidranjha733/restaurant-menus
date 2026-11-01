import { Breadcrumbs, JsonLd } from "@/components/Layout";
import { GuideList } from "@/components/GuideList";
import { GUIDES_BASE, getGuides, guidePath } from "@/lib/guides";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const TITLE = "Restaurant Guides: Menu Questions Answered";
const DESCRIPTION = "Short, plain answers to common restaurant questions: signature items, deals, discounts and how chain policies work.";
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Guides", path: `${GUIDES_BASE}/` },
];

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: `${GUIDES_BASE}/` });

export default function GuidesHubPage() {
  const guides = getGuides();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbJsonLd(CRUMBS),
            {
              "@type": "ItemList",
              name: "Restaurant guides",
              itemListElement: guides.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.seo.h1, url: absoluteUrl(guidePath(g.slug)) })),
            },
          ],
        }}
      />
      <Breadcrumbs crumbs={CRUMBS} />
      <h1>Restaurant Guides</h1>
      <p className="lead">Short, plain answers to the questions people ask about restaurant chains: signature items, deals, discounts and policies.</p>
      <GuideList guides={guides} />
    </>
  );
}
