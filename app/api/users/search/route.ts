import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// CORS headers
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
    // Get the query parameter
    const query = request.nextUrl.searchParams.get("q");
    
    if (!query || query.length < 2) {
      return NextResponse.json(
        { users: [] },
        { status: 200, headers: corsHeaders }
      );
    }
    
    // Get all users from Clerk
    const usersResponse = await clerkClient.users.getUserList({
      limit: 50,
    });
    
    // Make sure we have an array of users to work with
    const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);
    
    // Filter users based on query (case-insensitive)
    const lowercaseQuery = query.toLowerCase();
    const filteredUsers = users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      return fullName.includes(lowercaseQuery) || 
        (user.username && user.username.toLowerCase().includes(lowercaseQuery));
    });
    
    // Map to return only necessary user data
    const mappedUsers = filteredUsers.map((user) => ({
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      imageUrl: user.imageUrl,
    })).slice(0, 10); // Limit to 10 results
    
    return NextResponse.json(
      { users: mappedUsers },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500, headers: corsHeaders }
    );
  }
}