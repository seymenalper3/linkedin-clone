import connectDB from "@/mongodb/db";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

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

export async function GET() {
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
    
    // Dynamically define User model if it doesn't exist
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      userId: String,
      role: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }));
    
    // Find user by Clerk ID
    const user = await User.findOne({ userId });
    
    // If user doesn't exist, default role is 'employee'
    const role = user?.role || 'employee';
    
    return NextResponse.json({ role }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { message: "Failed to check user role" },
      { status: 500, headers: corsHeaders }
    );
  }
}