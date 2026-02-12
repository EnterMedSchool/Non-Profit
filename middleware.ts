import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);
// localeDetection defaults to true:
// - First visit: reads Accept-Language header, redirects to best match
// - Subsequent visits: reads NEXT_LOCALE cookie (set when user switches manually)
// - Cookie persists user's manual language choice across sessions

export const config = {
  // Match all pathnames except API routes, static files, internal Next.js paths,
  // and standalone full-screen tool routes (these are non-localized).
  matcher: ["/((?!api|_next|_vercel|create|flashcards|mcq|editor|.*\\..*).*)"],
};
