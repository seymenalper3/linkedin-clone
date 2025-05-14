import { auth, currentUser } from "@clerk/nextjs/server";
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
    
    const user = await currentUser();
    
    return NextResponse.json({ user }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500, headers: corsHeaders }
    );
  }
}