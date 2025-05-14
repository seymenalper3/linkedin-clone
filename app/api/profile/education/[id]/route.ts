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

// Delete education entry
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
    
    const educationId = params.id;
    
    if (!educationId) {
      return NextResponse.json(
        { message: "Education ID is required" },
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
    
    // Remove education from the profile
    await profile.removeEducation(educationId);
    
    return NextResponse.json(
      { 
        success: true,
        education: profile.education 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error removing education:", error);
    return NextResponse.json(
      { message: "Failed to remove education" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Update education entry
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
    
    const educationId = params.id;
    
    if (!educationId) {
      return NextResponse.json(
        { message: "Education ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Get updated education data from request body
    const updatedEducation = await request.json();
    
    // Connect to the database
    await connectDB();
    
    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    
    if (!profile || !profile.education) {
      return NextResponse.json(
        { message: "Profile or education entries not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Find the education entry to update
    const educationIndex = profile.education.findIndex(
      (edu: any) => edu._id.toString() === educationId
    );
    
    if (educationIndex === -1) {
      return NextResponse.json(
        { message: "Education entry not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Update the education entry
    profile.education[educationIndex] = {
      ...profile.education[educationIndex],  // Just use the object directly
      ...updatedEducation
    };
    
    await profile.save();
    
    return NextResponse.json(
      { 
        success: true,
        education: profile.education 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { message: "Failed to update education" },
      { status: 500, headers: corsHeaders }
    );
  }
}