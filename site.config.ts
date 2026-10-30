/**
 * The one place to change site-wide settings.
 * Canonical URLs, sitemap, robots, header, footer and JSON-LD all read from here.
 */

/** Public name of the site. Placeholder: set the real name before launch. */
export const SITE_NAME = "Menu Price Guide";

/** Production origin, no trailing slash. Placeholder: set the real domain before launch. */
export const DOMAIN = "https://example.com";

/** Short line used on the homepage and in the footer. */
export const SITE_TAGLINE = "Independent guide to US restaurant menus and prices";

/** Contact address shown in the footer. Empty = hidden. */
export const CONTACT_EMAIL = "";

/** Google Search Console HTML-tag verification code (the `content` value only). Empty = no tag. */
export const SEARCH_CONSOLE_VERIFICATION = "";

/**
 * false (default): every page gets <meta name="robots" content="noindex, nofollow">
 * and robots.txt disallows everything. Flip to true once the real domain is live.
 */
export const INDEXING = false;

/**
 * Amazon Associates tracking ID (e.g. "yoursite-20") for the "make at home" product cards.
 * Empty = cards link to plain Amazon searches and no affiliate disclosure is shown.
 */
export const AMAZON_ASSOCIATE_TAG = "";

/** URL prefix for brand menu pages and the hub: /menu/ and /menu/<slug>/. */
export const MENU_BASE = "/menu";

/** Main navigation. */
export const NAV = [
  { href: "/", label: "Home" },
  { href: `${MENU_BASE}/`, label: "All menus" },
];
