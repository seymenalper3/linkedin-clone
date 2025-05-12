"use server";

import { Notification, NotificationType } from "@/mongodb/models/notification";
import connectDB from "@/mongodb/db";
import { clerkClient } from "@clerk/nextjs";

// Helper function to create notification
export async function createNotification({
  recipientId,
  senderId,
  type,
  postId,
  commentId
}: {
  recipientId: string;
  senderId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
}) {
  // Skip self-notifications
  if (recipientId === senderId) {
    return { success: true, message: "Skipped self-notification" };
  }

  try {
    // Connect to database
    await connectDB();

    // Get sender information from Clerk
    let content = "";
    let senderName = "Someone";
    
    try {
      const sender = await clerkClient.users.getUser(senderId);
      senderName = `${sender.firstName || 'Unknown'} ${sender.lastName || 'User'}`;
    } catch (error) {
      console.error(`Error fetching sender details:`, error);
      // Continue with default name if Clerk API fails
    }

    // Create appropriate content message based on notification type
    switch (type) {
      case 'follow':
        content = `${senderName} started following you`;
        break;
      case 'like':
        content = `${senderName} liked your post`;
        break;
      case 'comment':
        content = `${senderName} commented on your post`;
        break;
      case 'job':
        content = `${senderName} posted a job that matches your profile`;
        break;
    }

    // Create the notification
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      content,
      postId,
      commentId,
      read: false
    });

    return { 
      success: true, 
      notification 
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { 
      success: false, 
      message: "Failed to create notification" 
    };
  }
}