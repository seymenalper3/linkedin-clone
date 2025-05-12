import connectDB from "@/mongodb/db";
import { Notification } from "@/mongodb/models/notification";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Mark a notification as read
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json(
        { message: "Missing notification ID" },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // First check if the notification belongs to this user
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }
    
    if (notification.recipientId !== userId) {
      return NextResponse.json(
        { message: "You don't have permission to modify this notification" },
        { status: 403 }
      );
    }
    
    // Mark it as read
    const updatedNotification = await Notification.markAsRead(notificationId);
    
    return NextResponse.json({ 
      message: "Notification marked as read",
      notification: updatedNotification,
      success: true
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { message: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}