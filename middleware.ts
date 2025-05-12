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
  '/api/debug-admin', // Debug endpoint for admin creation
  '/admin-setup', // New simplified admin setup page
  '/role-selection', // Role selection page after registration
  '/api/users/check-role', // Role check API endpoint
  '/network', // Network page to view connections
  '/users', // Users page to find people
  '/users/(.*)', // User profile pages
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
    
    // Allow access to role selection page
    if (req.nextUrl.pathname === '/role-selection') {
      return NextResponse.next();
    }
    
    // Allow access to API endpoints
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    // If the user is signed in, only check role for specific content creation paths
    if (auth.userId) {
      // Define paths that require role selection
      const roleRequiredPaths = [
        '/posts/create', // hypothetical post creation path
        '/jobs/create',  // hypothetical job creation path
      ];

      // Check if current path requires role
      const requiresRole = roleRequiredPaths.some(path =>
        req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path + '/')
      );

      // Skip role check for all paths except those that explicitly require it
      // This is a more targeted approach than checking all routes
      if (requiresRole && req.nextUrl.pathname !== '/role-selection') {
        // Store the original URL to redirect back after role selection
        const originalUrl = req.nextUrl.pathname;

        // Redirect to the role-check API
        const roleCheckUrl = new URL(`/api/users/check-role?redirect=${encodeURIComponent(originalUrl)}`, req.url);
        return NextResponse.redirect(roleCheckUrl);
      }
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