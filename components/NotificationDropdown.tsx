"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { INotification } from "@/mongodb/models/notification";

interface NotificationDropdownProps {
  onClose: () => void;
  onViewAll: () => void;
}

export default function NotificationDropdown({ onClose, onViewAll }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=5");
        if (!response.ok) throw new Error("Failed to fetch notifications");
        
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Map notification type to link URL
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
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50"
    >
      <div className="p-3 border-b">
        <h3 className="font-semibold text-lg">Notifications</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => (
              <Link 
                key={notification._id} 
                href={getNotificationLink(notification)}
                className="block hover:bg-gray-50"
              >
                <div className={`p-3 border-b ${!notification.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${notification.senderId}`} />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.createdAt 
                          ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) 
                          : 'recently'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No notifications yet</div>
        )}
      </div>

      <div className="p-3 border-t bg-gray-50">
        <Button 
          onClick={onViewAll}
          variant="outline" 
          className="w-full"
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );
}