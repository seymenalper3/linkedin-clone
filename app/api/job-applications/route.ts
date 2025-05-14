import connectDB from "@/mongodb/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Application } from "@/mongodb/models/application";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Get applications for the current user (as applicant or employer)
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Connect to the database
    await connectDB();
    
    // Get query params
    const type = request.nextUrl.searchParams.get("type") || "applicant";
    const postId = request.nextUrl.searchParams.get("postId");
    
    // Get user's role
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      userId: String,
      role: String,
    }));
    
    const dbUser = await User.findOne({ userId });
    const userRole = dbUser?.role || "employee";
    
    let applications;
    
    if (postId) {
      // Get applications for a specific post
      applications = await Application.getApplicationsForPost(postId);
      
      // Check if user is the employer of the post
      const employerApplications = applications.filter(app => app.employer.userId === userId);
      
      if (employerApplications.length === 0 && applications.length > 0) {
        return NextResponse.json(
          { message: "You are not authorized to view these applications" },
          { status: 403, headers: corsHeaders }
        );
      }
    } else if (type === "applicant") {
      // Get applications where user is the applicant
      applications = await Application.getApplicationsForUser(userId);
    } else if (type === "employer" && userRole === "employer") {
      // Get applications for jobs posted by this employer
      applications = await Application.getApplicationsForEmployer(userId);
    } else {
      return NextResponse.json(
        { message: "Invalid request" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { applications },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error getting applications:", error);
    return NextResponse.json(
      { message: "Failed to get applications" },
      { status: 500, headers: corsHeaders }
    );
  }
}