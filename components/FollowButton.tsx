"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
}

const FollowButton = ({ targetUserId, isFollowing: initialIsFollowing }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleFollowToggle = async () => {
    setIsLoading(true);
    
    try {
      const endpoint = "/api/users/follow";
      const method = isFollowing ? "DELETE" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update follow status");
      }
      
      // Toggle follow state
      setIsFollowing(!isFollowing);
      
      // Show success message
      toast.success(
        isFollowing ? "Unfollowed successfully" : "Followed successfully"
      );
      
      // Refresh the page to update counts
      router.refresh();
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={isFollowing ? "" : "bg-[#0B63C4]"}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {isFollowing ? "Unfollowing..." : "Following..."}
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Connected
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Connect
        </>
      )}
    </Button>
  );
};

export default FollowButton;