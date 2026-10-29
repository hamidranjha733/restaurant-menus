import type { Metadata } from "next";
import { MENU_BASE } from "@/site.config";

export const metadata: Metadata = {
  title: { absolute: "Page not found" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p className="lead">
        That page doesn&apos;t exist. Try the <a href={`${MENU_BASE}/`}>full list of menus</a> or the <a href="/">homepage</a>.
      </p>
    </>
  );
}
