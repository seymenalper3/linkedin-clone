"use server";

import { Notification, NotificationType } from "@/mongodb/models/notification";
import connectDB from "@/mongodb/db";
import { clerkClient } from "@clerk/nextjs/server";

// Helper function to create notification
// Interface for reference data
interface Reference {
  postId?: string;
  commentId?: string;
  applicationId?: string;
}

export async function notifyUser({
  fromUserId,
  toUserId,
  type,
  message,
  reference
}: {
  fromUserId: string;
  toUserId: string;
  type: NotificationType;
  message: string;
  reference?: Reference;
}) {
  return createNotification({
    recipientId: toUserId,
    senderId: fromUserId,
    type,
    content: message,
    postId: reference?.postId,
    commentId: reference?.commentId,
    applicationId: reference?.applicationId
  });
}

export async function createNotification({
  recipientId,
  senderId,
  type,
  postId,
  commentId,
  applicationId,
  content
}: {
  recipientId: string;
  senderId: string;
  type: NotificationType;
  content?: string;
  postId?: string;
  commentId?: string;
  applicationId?: string;
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

    // Create appropriate content message based on notification type if not provided
    if (!content) {
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
        case 'job_application':
          content = `${senderName} applied to your job post`;
          break;
      }
    }

    // Create the notification
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      content,
      postId,
      commentId,
      applicationId,
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