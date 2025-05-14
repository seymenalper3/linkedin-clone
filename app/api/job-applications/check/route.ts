import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/mongodb/db";
import { Application } from "@/mongodb/models/application";

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Get postId from query params
    const postId = request.nextUrl.searchParams.get("postId");
    
    if (!postId) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Connect to the database
    await connectDB();
    
    // Check if the user has already applied to this job
    const application = await Application.findOne({
      postId,
      'applicant.userId': userId
    });
    
    return NextResponse.json(
      { hasApplied: !!application },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error checking application status:", error);
    return NextResponse.json(
      { message: "Failed to check application status" },
      { status: 500, headers: corsHeaders }
    );
  }
}