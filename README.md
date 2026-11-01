# Restaurant Menus

Independent guide to US restaurant menus and prices. Next.js (App Router), TypeScript, fully static export, deployed on Vercel. One JSON file per brand; every page is generated from those files.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server at http://localhost:3000 |
| `npm run build` | Static build to `/out` (then strips framework JS) |
| `npm run check` | After a build: title/description lengths, one H1, canonical, valid JSON-LD, broken links, no stray JS. Also lists linked brands not added yet |
| `npm run serve` | Serve `/out` at http://localhost:4173 the way Vercel will |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |

## Pages

| URL | Source |
| --- | --- |
| `/` | `app/page.tsx`: categories and recently updated menus |
| `/menu/` | `app/menu/page.tsx`: hub, every brand by category plus an A-Z index |
| `/menu/<slug>/` | `app/menu/[slug]/page.tsx`: the brand menu template |
| `/category/<slug>/` | `app/category/[slug]/page.tsx`: one per category that has at least one brand |
| `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts`, `app/robots.ts` |

## Adding a brand

Add `data/brands/<slug>.json`. The file name must equal `slug`, and the page goes live at `/menu/<slug>/`. It shows up automatically on the hub, its category page, the homepage and the sitemap. `data/brands/texas-roadhouse-menu.json` is the reference example.

| Field | Notes |
| --- | --- |
| `slug` | lowercase-kebab-case, e.g. `texas-roadhouse-menu` |
| `brand` | Display name |
| `site_category` | Must match a `name` in `data/categories.json` |
| `url_path` | Optional; if set it must be `/menu/<slug>/` |
| `seo.meta_title` | Exact `<title>`, max 60 chars |
| `seo.meta_description` | Max 160 chars |
| `seo.h1` | Page heading |
| `last_updated` | `YYYY-MM` or `YYYY-MM-DD` |
| `price_disclaimer` | Shown at the top and bottom of the page |
| `intro` | Opening paragraph, under the heading "<Brand> Menu Prices at a Glance" |
| `menu[]` | `{ category, intro?, note?, items: [{ name, size, price, calories?, desc? }] }`. `size` is `""` when there is one size; `price` is `$12.99`, a range `$11.85 – $13.55`, one price per size `$6.99 / $10.49` (pair it with a size like `6in / footlong`), an add-on `+$0.75` or a short word such as `Included` (ranges and per-size prices become an AggregateOffer in the JSON-LD; words get no offer); `calories` is digits only or `""` (never estimate). Tables never have empty cells: the size is shown in the item name, e.g. "Hand-Cut Sirloin (6 oz)" (left off when the name already says it, e.g. "2 Pc Chicken" with size "2 pieces"), and a Calories column appears only when every item in the section has calories; otherwise known calories go on the item's sub-line ("desc · 290 cal"). `desc` is a short muted line under the item name. Calories and descriptions go into the Menu JSON-LD. Every brand page also gets a row of jump links, one per menu section |
| `highlights` | Optional `[{ strong, label }]`, shown as pills under the hero (`strong` in bold accent) |
| `quick_answer` | Optional short answer shown in a box after the intro, inside "<Brand> Menu Prices at a Glance" |
| `hot_deal` | Optional current deal, shown as a callout under the jump tabs |
| `included_box` | Optional `{ title, rows: [{ label, detail }] }` table, e.g. what comes free with every meal |
| `hero_image` | Optional `{ url, alt, credit? }`. Full-width banner with the breadcrumb and H1 over it. `url` must be https and is loaded by the visitor's browser (e.g. the Pexels CDN), never downloaded at build time |
| `make_at_home` | Optional `{ title, intro?, cards: [{ icon?, name, blurb, amazon_search }] }`. `icon` is an emoji shown large on the card. Each card links to an Amazon search with `rel="sponsored nofollow"`. Set `AMAZON_ASSOCIATE_TAG` in `site.config.ts` to add your tracking ID and show the Amazon disclosure |
| `popular_items[]` | Optional list |
| `faqs[]` | Optional `{ q, a }`; rendered on the page and as FAQPage JSON-LD |
| `internal_links[]` | Slugs of other brands. Links to brands not added yet are skipped and appear on their own once that JSON exists. The related list is topped up with other brands in the same category |
| `seo.primary_keyword`, `seo.keyword_*`, `schema`, `_data_notes` | Editorial only, never rendered |

The build validates every brand file and fails with a list of problems (unknown category, bad price format, title too long and so on), so a typo never ships as a broken page.

Each brand page outputs one JSON-LD `@graph` with WebPage, BreadcrumbList (Home > Menus > Category > Brand), Menu (sections, items, USD offers) and FAQPage.

## Categories

`data/categories.json` holds the categories in display order. A category page exists only once a brand uses it. To add a category, add `{ name, slug, description }` there.

## Settings: `site.config.ts`

Site name, domain, tagline, contact email, Search Console code, nav and:

- `INDEXING` (default `false`): every page gets `noindex, nofollow` and robots.txt disallows everything. Set it to `true` once the real domain is live.
- `MENU_BASE` (default `/menu`): the prefix for the hub and brand pages.
- `AMAZON_ASSOCIATE_TAG` (default empty): Amazon tracking ID for the `make_at_home` cards.

`SITE_NAME` and `DOMAIN` are placeholders: set them before launch.

## No client JavaScript

Pages are server-rendered HTML. `scripts/postbuild.mjs` removes Next.js hydration scripts from `/out`, so the only scripts left are JSON-LD blocks. Links are plain `<a>` tags.

## Deploy to Vercel

Import the repo in Vercel. `vercel.json` already sets the build command and the `out` folder. Add the domain, set `DOMAIN` and `SITE_NAME`, set `INDEXING = true`, and push.

## Guides

Short Q&A articles live in `data/guides/<slug>.json` (shape: `Guide` in `lib/types.ts`) and build to `/guides/<slug>/`, with a hub at `/guides/`. The build checks them like brand files (title ≤ 60, description ≤ 160, required fields). `brand_slug` must name an existing brand file or be `""`; when set, the guide reuses that brand's hero image and is listed on its menu page. `internal_links` can point at brand menus or other guides by slug; ones that do not exist yet are skipped and listed by `npm run check`.
