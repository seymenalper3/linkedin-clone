import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define your public routes
const publicPaths = [
  '/',
  '/sign-in*',
  '/sign-up*',
  '/api/public*',
];

export default clerkMiddleware((auth, req) => {
  // Check if the path is in our public paths list
  const isPublic = publicPaths.some(path => {
    const pathWithoutWildcard = path.replace('*', '');
    return req.nextUrl.pathname === pathWithoutWildcard || 
           req.nextUrl.pathname.startsWith(pathWithoutWildcard) && path.endsWith('*');
  });

  // If the route is public or it's an asset, let the request pass through
  if (isPublic || req.nextUrl.pathname.includes('.')) {
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