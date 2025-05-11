import { authMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { adminMiddleware } from "./middleware/adminMiddleware";

// Clerk's authMiddleware handles auth for all routes
// This allows auth() function to work in your application
export default authMiddleware({
  // Routes that can be accessed without authentication
  publicRoutes: ["/", "/sign-in", "/sign-up"],

  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/public"],

  // Function to run before the auth middleware
  beforeAuth: (req) => {
    // Admin panel routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      return adminMiddleware(req);
    }
    return NextResponse.next();
  },
});

// We need to add this boilerplate to make authMiddleware work correctly with Next.js
// https://clerk.com/docs/nextjs/middleware
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
