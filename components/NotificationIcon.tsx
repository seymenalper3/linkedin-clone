"use client";

import { useState, useEffect, useCallback } from "react";
import { BellIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { useUser } from "@clerk/nextjs";
import NotificationDropdown from "./NotificationDropdown";
import { useRouter } from "next/navigation";

export default function NotificationIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      const response = await fetch("/api/notifications?limit=1");
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [isSignedIn]);

  // Fetch unread count when component mounts and when user changes
  useEffect(() => {
    if (isSignedIn) {
      fetchUnreadCount();

      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn, user?.id, fetchUnreadCount]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    
    // Mark notifications as read when opening the dropdown
    if (!isDropdownOpen && unreadCount > 0) {
      fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })
        .then(() => setUnreadCount(0))
        .catch(error => console.error("Error marking notifications as read:", error));
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="icon relative"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon className="h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
        <p>Notifications</p>
      </button>

      {isDropdownOpen && (
        <NotificationDropdown 
          onClose={() => setIsDropdownOpen(false)}
          onViewAll={() => {
            setIsDropdownOpen(false);
            router.push('/notifications');
          }}
        />
      )}
    </div>
  );
}