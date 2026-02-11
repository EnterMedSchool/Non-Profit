import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
  // All locales are prefixed in the URL (/en/resources, /he/resources, etc.)
  localePrefix: "always",
});
