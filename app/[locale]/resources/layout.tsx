import type { Metadata } from "next";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export const metadata: Metadata = {
  openGraph: {
    images: [{ url: ogImagePath("resources"), width: 1200, height: 630 }],
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
