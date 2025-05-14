import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Application, ApplicationStatus } from "@/mongodb/models/application";
import mongoose from "mongoose";

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Update application status endpoint
export async function PATCH(
  request: NextRequest,
  { params }: { params: { application_id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Get the application ID from the URL parameter
    const applicationId = params.application_id;
    
    if (!applicationId) {
      return NextResponse.json(
        { message: "Application ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Get the new status from the request body
    const body = await request.json();
    const { status } = body;
    
    // Validate status
    const validStatuses: ApplicationStatus[] = ['pending', 'reviewing', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status as ApplicationStatus)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Connect to MongoDB
    await connectDB();
    
    // Find the application by ID
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Check if user is the employer of this application
    if (application.employer.userId !== userId) {
      return NextResponse.json(
        { message: "You are not authorized to update this application" },
        { status: 403, headers: corsHeaders }
      );
    }
    
    // Update application status
    application.status = status as ApplicationStatus;
    await application.save();
    
    return NextResponse.json(
      { 
        message: "Application status updated successfully",
        application
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { message: "Failed to update application status" },
      { status: 500, headers: corsHeaders }
    );
  }
}