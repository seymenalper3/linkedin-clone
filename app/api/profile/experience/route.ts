import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";
import { IExperience } from "@/mongodb/models/profile";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Add experience to profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Get experience data from request body
    const experienceData: IExperience = await request.json();
    
    // Validate required fields
    if (!experienceData.title || !experienceData.company || !experienceData.startDate) {
      return NextResponse.json(
        { message: "Title, company, and start date are required" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Connect to the database
    await connectDB();
    
    // Find the user's profile
    let profile = await Profile.findOne({ userId });
    
    // If no profile exists, create one
    if (!profile) {
      profile = new Profile({ userId });
    }
    
    // Add experience to the profile
    await profile.addExperience(experienceData);
    
    return NextResponse.json(
      { 
        success: true,
        experience: profile.experience 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error adding experience:", error);
    return NextResponse.json(
      { message: "Failed to add experience" },
      { status: 500, headers: corsHeaders }
    );
  }
}