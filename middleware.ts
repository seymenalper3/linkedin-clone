import { NextRequest, NextResponse } from "next/server";
import { adminMiddleware } from "./middleware/adminMiddleware";

// Simple middleware that just handles admin routes
export default function middleware(req: NextRequest) {
  // Admin panel routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return adminMiddleware(req);
  }

  return NextResponse.next();
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
