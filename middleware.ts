import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in*',
  '/sign-up*',
  '/api/public*',
];

// Create route matcher to check if path should be public
const isPublic = createRouteMatcher(publicRoutes);

export default clerkMiddleware((auth, req) => {
  // If the route is public or it's an asset, let the request pass through
  if (isPublic(req.url) || req.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Admin panel routes - check if they are admin in the server component
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // For protected routes, check if the user is authenticated
  if (!auth.userId) {
    const signInUrl = new URL('/', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
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