import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Check if requesting another user's profile
    const requestedUserId = request.nextUrl.searchParams.get("userId");
    
    // Use requested user ID or fall back to authenticated user
    const targetUserId = requestedUserId || userId;
    
    // Connect to the database
    await connectDB();
    
    // Find the user's profile
    const profile = await Profile.findOne({ userId: targetUserId });
    
    // If no profile exists, return an empty profile structure
    if (!profile) {
      return NextResponse.json(
        { 
          profile: { 
            userId: targetUserId,
            education: [],
            experience: [],
            skills: []
          } 
        },
        { headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { profile },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error getting profile:", error);
    return NextResponse.json(
      { message: "Failed to get profile" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Create or update profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Get profile data from request body
    const profileData = await request.json();
    
    // Ensure the profile is for the authenticated user
    profileData.userId = userId;
    
    // Connect to the database
    await connectDB();
    
    // Find and update or create the profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      profileData,
      { upsert: true, new: true }
    );
    
    return NextResponse.json(
      { 
        success: true,
        profile 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500, headers: corsHeaders }
    );
  }
}