import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { adminMiddleware } from "./middleware/adminMiddleware";

// This middleware executes in the order defined
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/api/webhook"],

  // Custom middleware to run before Clerk's auth middleware
  beforeAuth: (req) => {
    // Admin panel routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      return adminMiddleware(req);
    }
    return NextResponse.next();
  },
});

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
