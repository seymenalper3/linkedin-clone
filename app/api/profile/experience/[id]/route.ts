import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Delete experience entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const experienceId = params.id;
    
    if (!experienceId) {
      return NextResponse.json(
        { message: "Experience ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Connect to the database
    await connectDB();
    
    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Remove experience from the profile
    await profile.removeExperience(experienceId);
    
    return NextResponse.json(
      { 
        success: true,
        experience: profile.experience 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error removing experience:", error);
    return NextResponse.json(
      { message: "Failed to remove experience" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Update experience entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const experienceId = params.id;
    
    if (!experienceId) {
      return NextResponse.json(
        { message: "Experience ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Get updated experience data from request body
    const updatedExperience = await request.json();
    
    // Connect to the database
    await connectDB();
    
    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    
    if (!profile || !profile.experience) {
      return NextResponse.json(
        { message: "Profile or experience entries not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Find the experience entry to update
    const experienceIndex = profile.experience.findIndex(
      (exp: any) => exp._id.toString() === experienceId
    );
    
    if (experienceIndex === -1) {
      return NextResponse.json(
        { message: "Experience entry not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Update the experience entry
    profile.experience[experienceIndex] = {
      ...profile.experience[experienceIndex],  // Just use the object directly
      ...updatedExperience
    };
    
    await profile.save();
    
    return NextResponse.json(
      { 
        success: true,
        experience: profile.experience 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { message: "Failed to update experience" },
      { status: 500, headers: corsHeaders }
    );
  }
}