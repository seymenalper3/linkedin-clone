import connectDB from "@/mongodb/db";
import { Notification } from "@/mongodb/models/notification";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Get all notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Optional query parameters
    const limit = request.nextUrl.searchParams.get("limit");
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    
    await connectDB();
    
    // Get notifications for this user
    const notifications = await Notification.getUserNotifications(userId, limitNumber);
    
    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);
    
    return NextResponse.json({ 
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Create a new notification (internal use only)
export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by the server only, not clients
    // In a production app, you'd add middleware or API key verification
    const { recipientId, senderId, type, content, postId, commentId } = await request.json();
    
    if (!recipientId || !senderId || !type || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Don't create notifications for yourself
    if (recipientId === senderId) {
      return NextResponse.json({
        message: "Skipped self-notification",
        success: true
      });
    }
    
    // Create the notification
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      content,
      ...(postId && { postId }),
      ...(commentId && { commentId }),
      read: false,
    });
    
    return NextResponse.json({ 
      message: "Notification created",
      notification,
      success: true
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { message: "Failed to create notification" },
      { status: 500 }
    );
  }
}