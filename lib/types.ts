/** Shape of one brand file in data/brands/<slug>.json. See README for field notes. */

export interface MenuItem {
  name: string;
  /** "" when the item has one size. */
  size: string;
  /** "$12.99", a range "$11.85 – $13.55", one price per size "$6.99 / $10.49", an add-on "+$0.75" or a short word like "Included". See lib/price.ts. */
  price: string;
  /** Digits only, e.g. "2250". "" or missing when there is no reliable figure; never estimate. */
  calories?: string;
  /** Short line shown under the item name, e.g. "Feeds 4 to 6, with 2 large sides". */
  desc?: string;
}

export interface MenuSection {
  category: string;
  /** Short paragraph under the section heading. */
  intro?: string;
  /** One-line note under the section heading (e.g. "Served with two sides."). */
  note?: string;
  items: MenuItem[];
}

export interface IncludedBox {
  title: string;
  rows: { label: string; detail: string }[];
}

export interface MakeAtHome {
  title: string;
  intro?: string;
  /** Each card links to an Amazon search for `amazon_search`. `icon` is an emoji shown above the name. */
  cards: { icon?: string; name: string; blurb: string; amazon_search: string }[];
}

export interface HeroImage {
  /** https URL, loaded by the visitor's browser (e.g. the Pexels CDN). Not downloaded at build time. */
  url: string;
  alt: string;
  /** Small credit line under the banner, e.g. "Pexels (free license)". */
  credit?: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Brand {
  slug: string;
  brand: string;
  /** Must match a `name` in data/categories.json. */
  site_category: string;
  /** Optional; when present it must equal /menu/<slug>/. */
  url_path?: string;
  seo: {
    meta_title: string;
    meta_description: string;
    h1: string;
    primary_keyword?: string;
    keyword_volume?: number;
    keyword_kd?: number;
  };
  /** "YYYY-MM" or "YYYY-MM-DD" */
  last_updated: string;
  price_disclaimer: string;
  intro: string;
  /** Short direct answer shown in a box near the top. */
  quick_answer?: string;
  /** Feature pills under the hero: `strong` in bold accent, then `label`. */
  highlights?: { strong: string; label: string }[];
  /** A current deal, shown as a callout. */
  hot_deal?: string;
  /** "What comes with every meal" table. */
  included_box?: IncludedBox;
  menu: MenuSection[];
  /** Amazon product cards. Links carry AMAZON_ASSOCIATE_TAG from site.config.ts when set. */
  make_at_home?: MakeAtHome;
  /** Banner photo behind the H1. Without it the page starts with a plain heading. */
  hero_image?: HeroImage;
  popular_items?: string[];
  faqs?: Faq[];
  /** Slugs of other brand pages. Ones without a JSON file yet are skipped until they exist. */
  internal_links?: string[];
  schema?: unknown;
  /** Editorial notes; never rendered. */
  _data_notes?: unknown;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
}
