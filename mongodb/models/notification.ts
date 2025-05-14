import mongoose, { Schema, Document, Model, models } from "mongoose";

// Define notification types
export type NotificationType = 
  | 'follow'           // Someone followed the user
  | 'like'             // Someone liked the user's post
  | 'comment'          // Someone commented on the user's post
  | 'job'              // Job matching user's interests
  | 'job_application'; // Someone applied to a job posting

export interface INotificationBase {
  recipientId: string;        // User ID of notification recipient
  senderId: string;           // User ID of the action performer (who liked, commented, followed)
  type: NotificationType;     // Type of notification
  read: boolean;              // Whether the notification has been read
  content: string;            // Notification message
  postId?: string;            // Optional: related post ID (for likes, comments)
  commentId?: string;         // Optional: related comment ID
}

// Document interface
export interface INotification extends INotificationBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Static methods
interface INotificationStatics {
  getUnreadCount(userId: string): Promise<number>;
  getUserNotifications(userId: string, limit?: number): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<boolean>;
}

// Combine document and statics
interface INotificationModel extends Model<INotification>, INotificationStatics {}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: ['follow', 'like', 'comment', 'job', 'job_application'] 
    },
    read: { type: Boolean, default: false },
    content: { type: String, required: true },
    postId: { type: String },
    commentId: { type: String },
    applicationId: { type: String },
  },
  {
    timestamps: true,
  }
);

// Get unread notification count for a user
NotificationSchema.statics.getUnreadCount = async function(userId: string) {
  try {
    return await this.countDocuments({ recipientId: userId, read: false });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// Get user notifications with optional limit
NotificationSchema.statics.getUserNotifications = async function(userId: string, limit = 20) {
  try {
    return await this.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return [];
  }
};

// Mark a notification as read
NotificationSchema.statics.markAsRead = async function(notificationId: string) {
  try {
    return await this.findByIdAndUpdate(
      notificationId, 
      { read: true },
      { new: true }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
};

// Mark all user notifications as read
NotificationSchema.statics.markAllAsRead = async function(userId: string) {
  try {
    const result = await this.updateMany(
      { recipientId: userId, read: false },
      { read: true }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

export const Notification =
  (models.Notification as INotificationModel) ||
  mongoose.model<INotification, INotificationModel>("Notification", NotificationSchema);