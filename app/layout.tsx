import type { Metadata, Viewport } from "next";
import { DOMAIN, SEARCH_CONSOLE_VERIFICATION, SITE_NAME } from "@/site.config";
import { SiteFooter, SiteHeader } from "@/components/Layout";
import { robotsMeta } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),
  applicationName: SITE_NAME,
  robots: robotsMeta,
  formatDetection: { telephone: false, email: false, address: false },
  ...(SEARCH_CONSOLE_VERIFICATION ? { verification: { google: SEARCH_CONSOLE_VERIFICATION } } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7a1f16",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body>
        <SiteHeader />
        <main className="wrap">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
