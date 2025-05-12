import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/mongodb/db";
import { Notification, INotification } from "@/mongodb/models/notification";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BellOff, UserPlus, ThumbsUp, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

async function NotificationsPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    return redirect("/");
  }

  // Connect to database
  await connectDB();

  // Get all user notifications
  const notifications = await Notification.getUserNotifications(userId, 50);

  // Get sender details for each notification
  const senderIdsSet = new Set(notifications.map(n => n.senderId));
  const senderIds = Array.from(senderIdsSet);
  
  const sendersData: Record<string, any> = {};
  
  for (const senderId of senderIds) {
    try {
      const user = await clerkClient.users.getUser(senderId);
      sendersData[senderId] = {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      };
    } catch (error) {
      console.error(`Error fetching user ${senderId}:`, error);
      // Provide fallback data
      sendersData[senderId] = {
        firstName: "Unknown",
        lastName: "User",
        imageUrl: null,
      };
    }
  }

  // Notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'like':
        return <ThumbsUp className="h-5 w-5 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <BellOff className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy • h:mm a');
  };

  // Get link for notification
  const getNotificationLink = (notification: INotification) => {
    switch (notification.type) {
      case 'follow':
        return `/users/${notification.senderId}`;
      case 'like':
      case 'comment':
        return notification.postId ? `/posts/${notification.postId}` : '/';
      default:
        return '/';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg border mt-5">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <BellOff className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <h3 className="text-xl font-semibold text-gray-700">No notifications yet</h3>
          <p className="text-gray-500 mt-1">
            When people interact with you or your posts, you&apos;ll see it here.
          </p>
          
          <div className="mt-6">
            <Link href="/users">
              <Button className="bg-blue-700 hover:bg-blue-800">
                Find People to Connect With
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const sender = sendersData[notification.senderId] || {};
            return (
              <Link 
                key={notification._id} 
                href={getNotificationLink(notification)}
              >
                <div className={`p-4 border rounded-lg hover:bg-gray-50 transition ${
                  !notification.read ? 'bg-blue-50 border-blue-100' : ''
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={sender.imageUrl} />
                        <AvatarFallback>
                          {sender.firstName?.[0]}
                          {sender.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <span className="text-xs font-medium text-blue-600 uppercase">
                          {notification.type}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900">
                        {notification.content}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.createdAt ? formatDate(notification.createdAt) : 'Recently'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;