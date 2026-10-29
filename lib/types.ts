/** Shape of one brand file in data/brands/<slug>.json. See README for field notes. */

export interface MenuItem {
  name: string;
  /** "" when the item has one size. */
  size: string;
  /** "$12.99" */
  price: string;
}

export interface MenuSection {
  category: string;
  note?: string;
  items: MenuItem[];
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
  menu: MenuSection[];
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
