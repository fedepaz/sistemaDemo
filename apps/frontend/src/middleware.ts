import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

// Only these routes are PUBLIC (don't require login)
const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  console.log("Middleware running for:", req.url);
  console.log("userId", userId);

  // If the request is not public, we need to authenticate the user.
  if (!isPublicRoute(req)) {
    await auth.protect();
    return intlMiddleware(req);
  }
  return NextResponse.next();
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
