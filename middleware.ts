import { authMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define your public routes
const publicPaths = [
  '/',
  '/sign-in*',
  '/sign-up*',
  '/api/public*',
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
      const pathWithoutWildcard = path.replace('*', '');
      return req.nextUrl.pathname === pathWithoutWildcard || 
             req.nextUrl.pathname.startsWith(pathWithoutWildcard) && path.endsWith('*');
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