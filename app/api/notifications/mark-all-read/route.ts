import connectDB from "@/mongodb/db";
import { Notification } from "@/mongodb/models/notification";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Mark all notifications as read for the current user
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Mark all as read
    const success = await Notification.markAllAsRead(userId);
    
    if (success) {
      return NextResponse.json({ 
        message: "All notifications marked as read",
        success: true
      });
    } else {
      return NextResponse.json({ 
        message: "No unread notifications found",
        success: true
      });
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { message: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}