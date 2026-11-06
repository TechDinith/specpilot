import { auth } from "@/lib/auth/server";

const hasAuth = Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);

const middleware = hasAuth
  ? auth.middleware({
      loginUrl: "/auth/sign-in",
      publicRoutes: ["/", "/analyze", "/projects", "/p"],
    })
  : () => undefined;

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};