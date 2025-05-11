import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, auth } from "@clerk/nextjs/server";
import { adminMiddleware } from "./middleware/adminMiddleware";

export default function middleware(req: NextRequest) {
  // Admin panel routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return adminMiddleware(req);
  }

  // For all other routes, use Clerk's middleware
  return clerkMiddleware({
    publicRoutes: ['/'],
    ignoredRoutes: ['/api/public']
  })(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Admin routes
    "/admin(.*)",
  ],
};
