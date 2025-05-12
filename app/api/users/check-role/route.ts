import connectDB from "@/mongodb/db";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Add CORS headers to prevent CORS issues
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const { userId } = auth();

  // Add CORS headers to response
  const response = {
    headers: corsHeaders,
  };

  if (!userId) {
    // Redirect to home if no user
    return NextResponse.redirect(new URL("/", request.url), response);
  }

  // Get the redirect URL from query params
  const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/";
  
  try {
    // Connect to DB
    await connectDB();

    // Set up User model
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      userId: String,
      role: String,
    }));

    // Check if user has a role
    const user = await User.findOne({ userId });

    // Validate that the role is valid if it exists
    const validRole = user?.role === 'employee' || user?.role === 'employer';

    if (!user || !user.role || !validRole) {
      // If no role is set or it's invalid, redirect to role selection
      return NextResponse.redirect(new URL("/role-selection", request.url), response);
    }

    // If user has a valid role, redirect to original destination
    return NextResponse.redirect(new URL(redirectUrl, request.url), response);
  } catch (error) {
    console.error("Error checking user role:", error);
    // In case of error, redirect to role selection to be safe
    return NextResponse.redirect(new URL("/role-selection", request.url), response);
  }
}