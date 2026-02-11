import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);
// localeDetection defaults to true:
// - First visit: reads Accept-Language header, redirects to best match
// - Subsequent visits: reads NEXT_LOCALE cookie (set when user switches manually)
// - Cookie persists user's manual language choice across sessions

export const config = {
  // Match all pathnames except API routes, static files, and internal Next.js paths
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
