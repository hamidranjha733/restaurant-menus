import { AMAZON_ASSOCIATE_TAG, CONTACT_EMAIL, SITE_NAME } from "@/site.config";

/**
 * The site's trust pages (About, methodology, policies). Each one is rendered by
 * components/InfoPage.tsx at /<slug>/. Text reads SITE_NAME and CONTACT_EMAIL from
 * site.config.ts, so renaming the site or adding an email updates every page.
 */
export interface InfoSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface InfoPage {
  slug: string;
  /** Short label for footer links. */
  label: string;
  title: string;
  description: string;
  h1: string;
  /** YYYY-MM-DD, shown as "Last updated". */
  updated: string;
  sections: InfoSection[];
}

const UPDATED = "2026-11-15";

const contactLine = CONTACT_EMAIL
  ? `Email us at ${CONTACT_EMAIL}.`
  : "Our contact email will be listed on this page shortly.";

export const INFO_PAGES: InfoPage[] = [
  {
    slug: "about",
    label: "About",
    title: `About ${SITE_NAME}`,
    description: `${SITE_NAME} is an independent guide to US restaurant menus, prices and policies. Who we are, what we cover and how we stay independent.`,
    h1: `About ${SITE_NAME}`,
    updated: UPDATED,
    sections: [
      {
        paragraphs: [
          `${SITE_NAME} is an independent guide to what things cost at American restaurants. We publish menus with typical prices for more than 100 chains, from fast food and coffee to steakhouses and regional favorites, along with short guides that answer the questions people search for: deals, hours, sauces, secret menus, who owns a chain and whether a restaurant is still open.`,
        ],
      },
      {
        heading: "What you'll find here",
        list: [
          "Menu pages with typical prices, grouped by section, plus a price range at a glance.",
          "Calories where a chain publishes official nutrition information.",
          "Restaurant guides that answer one question clearly, with the facts checked against public sources.",
          "A free calorie calculator that runs entirely in your browser.",
        ],
      },
      {
        heading: "We're independent",
        paragraphs: [
          `${SITE_NAME} is not affiliated with, endorsed by or paid by any restaurant we cover. Restaurants can't buy coverage or a better write-up. Brand names and trademarks belong to their owners and are used only to identify the restaurants we describe.`,
        ],
      },
      {
        heading: "How we make money",
        paragraphs: [
          AMAZON_ASSOCIATE_TAG
            ? "Some pages include links to kitchen products on Amazon. As an Amazon Associate we earn from qualifying purchases, at no extra cost to you. These links never affect the prices or facts we publish."
            : "Some pages include links to kitchen products on Amazon. If we earn a commission from these links in the future, we'll say so on every page that has them. They never affect the prices or facts we publish.",
        ],
      },
      {
        heading: "Get in touch",
        paragraphs: [
          `Spotted a wrong price, a closed restaurant or a menu we should add? ${contactLine} You can read more about how we work in How We Check Prices and our Editorial Policy.`,
        ],
      },
    ],
  },
  {
    slug: "how-we-check-prices",
    label: "How We Check Prices",
    title: "How We Check Restaurant Prices",
    description: `How ${SITE_NAME} finds, checks and updates restaurant menu prices and calories, why prices vary by location, and how to report a wrong price.`,
    h1: "How We Check Prices",
    updated: UPDATED,
    sections: [
      {
        paragraphs: [
          "Restaurant prices in the US aren't the same everywhere. Most chains are franchised, and owners set their own prices based on rent, wages and local costs. Airports, stadiums, theme parks and big-city locations usually charge more, and delivery apps add their own markups. That means there's rarely one official price for an item. Here's how we arrive at the numbers you see.",
        ],
      },
      {
        heading: "Where our prices come from",
        list: [
          "Official restaurant websites, online ordering pages and apps, where a chain publishes prices.",
          "Independent menu-price trackers and published menus from several locations, which we compare against each other.",
          "Company announcements and news coverage for new items, price changes, limited-time deals and closures.",
          "Reader reports, which we check before changing a page.",
        ],
      },
      {
        heading: "How we choose the number we show",
        paragraphs: [
          "When sources agree, we show a single typical price. When they disagree or a chain prices very differently by market, we show a range, such as $10.79 – $16.49, so you know what to expect. We leave out prices that are clearly from airports, theme parks or delivery apps unless we say so on the page.",
          "Steakhouses and other restaurants that list items at market price are marked that way rather than given a made-up figure.",
        ],
      },
      {
        heading: "Calories",
        paragraphs: [
          "We only show calories that come from a chain's published nutrition information or that more than one reliable source agrees on. If we can't confirm a figure, we leave it blank instead of guessing.",
        ],
      },
      {
        heading: "Keeping pages current",
        paragraphs: [
          "Every menu page and guide shows when it was last updated. We update pages when a chain changes prices, adds or drops items, launches a deal, or opens or closes locations. When a restaurant closes, we say so clearly at the top of its page.",
        ],
      },
      {
        heading: "What our prices are not",
        paragraphs: [
          "Our prices are a guide, not a quote. They don't include tax, tips or delivery fees, and your local restaurant may charge more or less. For the exact price at a specific location, check the restaurant's own app or website with that store selected.",
        ],
      },
      {
        heading: "Report a wrong price",
        paragraphs: [
          `If a price on our site doesn't match what you paid, please tell us. Include the restaurant, the city or location, the date and, if you can, a photo of the menu board or receipt. ${contactLine}`,
        ],
      },
    ],
  },
  {
    slug: "editorial-policy",
    label: "Editorial Policy",
    title: "Editorial Policy",
    description: `The standards ${SITE_NAME} follows for accuracy, sourcing, independence and corrections on every menu page and restaurant guide.`,
    h1: "Editorial Policy",
    updated: UPDATED,
    sections: [
      {
        paragraphs: [
          `Everything on ${SITE_NAME} is written to help diners make a quick, informed decision. These are the standards we hold every menu page and guide to.`,
        ],
      },
      {
        heading: "Accuracy first",
        list: [
          "Facts such as ownership, closures, opening dates, deals and policies are checked against official sources, company statements or reputable news reports before we publish.",
          "When sources conflict, we say so or show a range instead of picking one at random.",
          "When something is uncertain or changing, such as a bankruptcy sale or a deal with no end date, we say that plainly and revisit the page.",
          "We don't invent calories, prices or quotes.",
        ],
      },
      {
        heading: "Independence",
        paragraphs: [
          "No restaurant pays for coverage, reviews or placement. We don't accept free meals or gifts in exchange for coverage. Affiliate links, where we use them, are limited to product suggestions and never change the facts or prices we report.",
        ],
      },
      {
        heading: "Neutral, useful writing",
        paragraphs: [
          "We describe restaurants fairly, including closures, controversies and policy changes, without taking sides. Our aim is to answer the question you searched for in the first few lines, then give the detail behind it.",
        ],
      },
      {
        heading: "Updates and corrections",
        paragraphs: [
          `Each page shows when it was last updated. If we get something wrong, we fix it as soon as we've confirmed the correct information. Significant corrections, such as a wrong closure status, are reflected in the page's update date. ${contactLine}`,
        ],
      },
    ],
  },
  {
    slug: "contact",
    label: "Contact",
    title: `Contact ${SITE_NAME}`,
    description: `Contact ${SITE_NAME} to report a wrong price, a closed restaurant or a missing menu, or for any other question.`,
    h1: "Contact Us",
    updated: UPDATED,
    sections: [
      {
        paragraphs: [
          `We read every message. ${contactLine}`,
        ],
      },
      {
        heading: "Reporting a price or menu change",
        paragraphs: ["The more detail you send, the faster we can update the page. Please include:"],
        list: [
          "The restaurant and the menu item.",
          "The city or location you visited.",
          "The date and the price you saw.",
          "A photo of the menu board or receipt, if you have one.",
        ],
      },
      {
        heading: "Requesting a menu",
        paragraphs: [
          "Can't find a restaurant you're looking for? Tell us the chain's name and where it operates, and we'll consider adding it.",
        ],
      },
      {
        heading: "Please note",
        paragraphs: [
          `${SITE_NAME} is not connected to any restaurant. We can't take orders, handle complaints about a meal, process refunds or answer questions about jobs at a restaurant. For those, please contact the restaurant directly.`,
        ],
      },
    ],
  },
  {
    slug: "privacy-policy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    description: `How ${SITE_NAME} handles information when you visit the site, including server logs, the calorie calculator, outside links and your choices.`,
    h1: "Privacy Policy",
    updated: UPDATED,
    sections: [
      {
        paragraphs: [
          `This policy explains what information ${SITE_NAME} collects when you visit, and how it's used. We've kept it short because we collect very little.`,
        ],
      },
      {
        heading: "Information we don't collect",
        paragraphs: [
          "You don't need an account to use the site, and we don't ask for your name, address or payment details. We don't sell personal information.",
        ],
      },
      {
        heading: "The calorie calculator",
        paragraphs: [
          "The calorie calculator runs entirely in your browser. The age, height, weight and other details you enter are not sent to us or stored on our servers.",
        ],
      },
      {
        heading: "Server logs",
        paragraphs: [
          "Like most websites, our hosting provider automatically records basic technical information when a page is requested, such as your IP address, browser type, the page visited and the time. This is used to keep the site running, secure and fast, and is not used to identify you.",
        ],
      },
      {
        heading: "Cookies and analytics",
        paragraphs: [
          "The site does not currently set its own cookies. If we add analytics or advertising in the future, such as Google Analytics or Google AdSense, those services may use cookies to measure visits or show ads, and we'll update this policy to name them and explain how to opt out.",
        ],
      },
      {
        heading: "Links to other sites",
        paragraphs: [
          AMAZON_ASSOCIATE_TAG
            ? "Some pages link to Amazon and other websites. As an Amazon Associate we earn from qualifying purchases. When you follow these links, the other site's own privacy policy applies, and Amazon may use cookies to record that you arrived from our site."
            : "Some pages link to Amazon and other websites. When you follow these links, the other site's own privacy policy applies.",
        ],
      },
      {
        heading: "Emails you send us",
        paragraphs: [
          "If you email us, we use your message and email address only to reply and, where relevant, to correct the site. We don't add you to any mailing list.",
        ],
      },
      {
        heading: "Children",
        paragraphs: ["The site is meant for a general audience and doesn't knowingly collect information from children under 13."],
      },
      {
        heading: "Changes and contact",
        paragraphs: [`We may update this policy and will change the date at the top when we do. Questions? ${contactLine}`],
      },
    ],
  },
  {
    slug: "terms",
    label: "Terms of Use",
    title: "Terms of Use",
    description: `The terms that apply when you use ${SITE_NAME}, including how our prices and information may be used and the limits of our responsibility.`,
    h1: "Terms of Use",
    updated: UPDATED,
    sections: [
      {
        paragraphs: [`By using ${SITE_NAME}, you agree to these terms. If you don't agree, please don't use the site.`],
      },
      {
        heading: "Information only",
        paragraphs: [
          "Everything on the site is general information about restaurants, provided as a guide. Prices, menus, hours, deals and nutrition information change often and vary by location. Always confirm with the restaurant before relying on any detail.",
        ],
      },
      {
        heading: "No affiliation",
        paragraphs: [
          "We are not affiliated with any restaurant mentioned on the site. Restaurant names, logos and trademarks belong to their owners and are used only to identify those restaurants.",
        ],
      },
      {
        heading: "Using our content",
        paragraphs: [
          `The text, tables and design of ${SITE_NAME} are our work. You may share links to our pages and quote short excerpts with a link back to the source page. Please don't copy whole pages or republish our price tables without permission.`,
        ],
      },
      {
        heading: "Outside links",
        paragraphs: [
          "We link to other websites, including restaurant sites and online stores, for your convenience. We don't control those sites and aren't responsible for their content, products or policies.",
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          `The site is provided "as is." To the fullest extent allowed by law, ${SITE_NAME} is not responsible for any loss or harm arising from use of the site or reliance on its information, including differences between our prices and what a restaurant charges.`,
        ],
      },
      {
        heading: "Changes",
        paragraphs: [`We may update these terms at any time by changing this page. Questions? ${contactLine}`],
      },
    ],
  },
  {
    slug: "disclaimer",
    label: "Disclaimer",
    title: "Disclaimer",
    description: `${SITE_NAME} prices, calories and restaurant details are approximate guides. Read what our information does and doesn't cover.`,
    h1: "Disclaimer",
    updated: UPDATED,
    sections: [
      {
        heading: "Prices are approximate",
        paragraphs: [
          "Menu prices on this site are typical prices gathered from public sources. They vary by location and change over time, and they don't include tax, tips or delivery fees. The price at your local restaurant may be different.",
        ],
      },
      {
        heading: "Nutrition information",
        paragraphs: [
          "Calories and other nutrition details come from restaurants' published information where available. Recipes and portions can change and vary by location. If you have an allergy, dietary restriction or medical condition, check the restaurant's official nutrition and allergen information and ask staff before ordering. Our calorie calculator gives general estimates and is not medical advice.",
        ],
      },
      {
        heading: "Deals, hours and openings",
        paragraphs: [
          "Deals, limited-time items, opening hours and restaurant openings or closures can change without notice. Confirm with the restaurant before you go.",
        ],
      },
      {
        heading: "Not affiliated",
        paragraphs: [
          `${SITE_NAME} is independent and is not affiliated with, endorsed by or sponsored by any restaurant listed. All trademarks belong to their owners.`,
        ],
      },
      {
        heading: "Affiliate links",
        paragraphs: [
          AMAZON_ASSOCIATE_TAG
            ? "As an Amazon Associate we earn from qualifying purchases. Product links on our pages may earn us a commission at no extra cost to you."
            : "Some pages link to products on Amazon. If these links earn us a commission in the future, we'll disclose it here and on the pages that use them.",
        ],
      },
    ],
  },
];

export const infoPath = (slug: string) => `/${slug}/`;

export function getInfoPage(slug: string): InfoPage {
  const page = INFO_PAGES.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown info page: ${slug}`);
  return page;
}
