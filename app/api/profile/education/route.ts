import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";
import { IEducation } from "@/mongodb/models/profile";

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

// Add education to profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Get education data from request body
    const educationData: IEducation = await request.json();
    
    // Validate required fields
    if (!educationData.school || !educationData.startYear) {
      return NextResponse.json(
        { message: "School and start year are required" },
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
    
    // Add education to the profile
    await profile.addEducation(educationData);
    
    return NextResponse.json(
      { 
        success: true,
        education: profile.education || [] 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error adding education:", error);
    return NextResponse.json(
      { message: "Failed to add education" },
      { status: 500, headers: corsHeaders }
    );
  }
}