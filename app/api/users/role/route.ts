import connectDB from "@/mongodb/db";
import { UserRole } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// Add CORS headers to prevent CORS issues
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { role } = await req.json();

    // Validate role
    if (!role || (role !== "employee" && role !== "employer")) {
      return NextResponse.json(
        { message: "Invalid role. Must be 'employee' or 'employer'" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Connect to the database
    await connectDB();

    // Dynamically define User model if it doesn't exist
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      userId: String,
      role: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }));

    // Find and update or create the user document
    const result = await User.findOneAndUpdate(
      { userId },
      { 
        userId, 
        role,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { success: true, user: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error setting user role:", error);
    return NextResponse.json(
      { message: "Failed to set user role" },
      { status: 500, headers: corsHeaders }
    );
  }
}