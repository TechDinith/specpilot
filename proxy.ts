import { auth } from "@/lib/auth/server";

const hasAuth = Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);

const middleware = hasAuth
  ? auth.middleware({
      loginUrl: "/auth/sign-in",
      publicRoutes: ["/", "/analyze", "/p", "/api", "/googledf41cbb3e682b374.html", "/robots.txt", "/sitemap.xml"],
    })
  : () => undefined;

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|googled.*\\.html|robots\\.txt|sitemap\\.xml).*)"],
};