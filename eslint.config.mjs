import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // The site ships no client router (scripts/postbuild.mjs strips hydration), so
    // plain <a> links are intentional: every navigation is a fast static page load.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"] },
];

export default config;
