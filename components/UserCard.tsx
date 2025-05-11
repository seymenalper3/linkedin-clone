"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
// Removed problematic import
import { Loader2, MessageSquare, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface UserCardProps {
  userId: string;
  relationship: "follower" | "following" | "none";
}

interface UserProfileData {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

async function fetchUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    // In a real app, you'd have an API to fetch user profile by userId
    // For now, we'll create a profile with the user ID info we have
    return { 
      id: userId,
      firstName: `User`,
      lastName: `${userId.slice(-4)}`,
      imageUrl: `https://ui-avatars.com/api/?name=User+${userId.slice(-4)}&background=random`,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

const UserCard = ({ userId, relationship }: UserCardProps) => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(relationship === "following");

  useEffect(() => {
    const loadProfile = async () => {
      if (userId) {
        const userProfile = await fetchUserProfile(userId);
        setProfile(userProfile);
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-md shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 border rounded-md shadow-sm">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const handleFollow = async () => {
    if (!user || !user.id) {
      toast.error("You must be signed in to follow users");
      return;
    }

    if (user.id === userId) {
      toast.error("You cannot follow yourself");
      return;
    }

    setFollowLoading(true);

    try {
      const response = await fetch("/api/followers", {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerUserId: user.id,
          followingUserId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      setIsFollowing(!isFollowing);
      toast.success(
        isFollowing ? "Unfollowed successfully" : "Followed successfully"
      );
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    toast.info("Messaging will be implemented soon!");
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white flex items-start gap-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={profile.imageUrl} />
        <AvatarFallback>
          {profile.firstName?.[0]}
          {profile.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">
          {profile.firstName} {profile.lastName}
        </h3>
        <p className="text-sm text-gray-500">@{profile.firstName?.toLowerCase()}{profile.lastName?.toLowerCase()}-{userId.slice(-4)}</p>
        
        <div className="mt-3 flex gap-2">
          {user?.id !== userId && (
            <>
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                disabled={followLoading}
                className={isFollowing ? "text-gray-700" : "bg-[#0B63C4]"}
              >
                {followLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : isFollowing ? (
                  <UserMinus className="h-4 w-4 mr-1" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-1" />
                )}
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessage}
                className="text-gray-700"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;