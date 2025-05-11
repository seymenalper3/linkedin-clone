import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Followers } from "@/mongodb/models/followers";

// POST function is used to follow a user
export async function POST(request: Request) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { targetUserId } = await request.json();
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID not provided" },
        { status: 400 }
      );
    }

    if (userId === targetUserId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Check if already following
    const existingFollow = await Followers.findOne({
      follower: userId,
      following: targetUserId,
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      );
    }

    // Create follow relationship
    await Followers.create({
      follower: userId,
      following: targetUserId,
    });

    return NextResponse.json({ success: true, message: "Successfully followed user" });
  } catch (error) {
    console.error("Error in follow API:", error);
    return NextResponse.json(
      { error: "An error occurred while following user" },
      { status: 500 }
    );
  }
}

// DELETE function is used to unfollow a user
export async function DELETE(request: Request) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { targetUserId } = await request.json();
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID not provided" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find and delete the follow relationship
    const follow = await Followers.findOneAndDelete({
      follower: userId,
      following: targetUserId,
    });

    if (!follow) {
      return NextResponse.json(
        { error: "Not following this user" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error in unfollow API:", error);
    return NextResponse.json(
      { error: "An error occurred while unfollowing user" },
      { status: 500 }
    );
  }
}