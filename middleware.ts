import { authMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define your public routes - using proper path-to-regexp patterns
const publicPaths = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
  '/admin/setup', // Admin setup page needs to be accessible
  '/admin/setup-direct', // Alternative admin setup page
];

export default authMiddleware({
  publicRoutes: publicPaths,
  afterAuth(auth, req) {
    // If the route is an asset, let the request pass through
    if (req.nextUrl.pathname.includes('.')) {
      return NextResponse.next();
    }
    
    // Admin panel routes - check if they are admin in the server component
    if (req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.next();
    }
    
    // If the user is not signed in and the route is not public, redirect to sign-in
    if (!auth.userId && !publicPaths.some(path => {
      if (path === '/') {
        return req.nextUrl.pathname === '/';
      }
      // For pattern matching like '/sign-in(.*)' we just check if the path starts with the base part
      const basePath = path.split('(')[0];
      return req.nextUrl.pathname.startsWith(basePath);
    })) {
      const signInUrl = new URL('/', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  }
});

// Configure routes that the middleware applies to
export const config = {
  matcher: [
    // Match all routes except static assets
    '/((?!_next/|public/|favicon.ico|images/|assets/).*)',
    // Match API routes
    '/api/((?!public/).*)',
  ],
};