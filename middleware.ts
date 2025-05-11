import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { adminMiddleware } from "./middleware/adminMiddleware";

// Simple middleware for authentication
export default async function middleware(req: NextRequest) {
  // Admin panel routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return adminMiddleware(req);
  }
  
  // For all other routes, we'll use a simple auth check
  // without using Clerk's middleware directly
  const { userId } = getAuth(req);
  
  // Protected routes that require authentication
  const protectedPaths = ['/messages', '/network'];
  
  // Check if the path is in our protected paths
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );
  
  // If it's a protected path but no user, redirect to home
  if (isProtectedPath && !userId) {
    const signInUrl = new URL('/', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
}

// Configure paths that the middleware applies to
export const config = {
  matcher: [
    // Skip Next.js static files and assets
    "/((?!_next/|public/|favicon.ico).*)",
    // Also match API routes
    "/api/:path*",
    // Admin routes
    "/admin/:path*",
    // Protected user routes
    "/messages/:path*",
    "/network/:path*"
  ],
};