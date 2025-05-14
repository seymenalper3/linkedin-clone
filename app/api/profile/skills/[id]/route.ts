import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Delete skill
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
    
    const skillId = params.id;
    
    if (!skillId) {
      return NextResponse.json(
        { message: "Skill ID is required" },
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
    
    // Remove skill from the profile
    await profile.removeSkill(skillId);
    
    return NextResponse.json(
      { 
        success: true,
        skills: profile.skills 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error removing skill:", error);
    return NextResponse.json(
      { message: "Failed to remove skill" },
      { status: 500, headers: corsHeaders }
    );
  }
}