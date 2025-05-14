import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";
import { ISkill } from "@/mongodb/models/profile";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Add skill to profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Get skill data from request body
    const skillData: ISkill = await request.json();
    
    // Validate required fields
    if (!skillData.name) {
      return NextResponse.json(
        { message: "Skill name is required" },
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
    
    // Check if skill already exists
    const skillExists = profile.skills?.some(
      (skill: ISkill) => skill.name.toLowerCase() === skillData.name.toLowerCase()
    );
    
    if (skillExists) {
      return NextResponse.json(
        { message: "Skill already exists in profile" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Add skill to the profile
    await profile.addSkill(skillData);
    
    return NextResponse.json(
      { 
        success: true,
        skills: profile.skills 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error adding skill:", error);
    return NextResponse.json(
      { message: "Failed to add skill" },
      { status: 500, headers: corsHeaders }
    );
  }
}