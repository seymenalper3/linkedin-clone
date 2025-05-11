import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import type { UserResource } from "@clerk/types";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import connectDB from "@/mongodb/db";
import { Followers } from "@/mongodb/models/followers";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";

interface UserPageProps {
  params: {
    user_id: string;
  };
}

async function UserPage({ params }: UserPageProps) {
  await connectDB();
  const { userId } = auth();
  const currentUserData = await currentUser();
  const { user_id } = params;
  
  if (!userId || !currentUserData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-800">
          Please sign in to view user profiles
        </h1>
      </div>
    );
  }

  // Check if viewing their own profile
  const isOwnProfile = userId === user_id;

  // Get user data from Clerk
  let profileUser: UserResource | null = null;
  try {
    profileUser = await clerkClient.users.getUser(user_id);
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  if (!profileUser) {
    return (
      <div className="bg-white rounded-lg border p-6 mt-5">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p>The user you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/users">
          <Button className="mt-4">Back to Users</Button>
        </Link>
      </div>
    );
  }

  // Check follow status
  let isFollowing = false;
  try {
    const followingStatus = await Followers.findOne({
      follower: userId,
      following: user_id,
    });
    isFollowing = !!followingStatus;
  } catch (error) {
    console.error("Error checking follow status:", error);
  }

  // Get follower and following counts
  let followerCount = 0;
  let followingCount = 0;
  try {
    const followers = await Followers.find({ following: user_id });
    const following = await Followers.find({ follower: user_id });
    followerCount = followers.length;
    followingCount = following.length;
  } catch (error) {
    console.error("Error fetching followers/following:", error);
  }

  return (
    <div className="bg-white rounded-lg border p-6 mt-5">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex flex-col items-center">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profileUser.imageUrl} alt={profileUser.firstName || "User"} />
            <AvatarFallback>
              {profileUser.firstName?.[0]}
              {profileUser.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex gap-4 mt-6">
            <div className="text-center">
              <p className="text-lg font-semibold">{followerCount}</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{followingCount}</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {profileUser.firstName} {profileUser.lastName}
          </h1>
          <p className="text-gray-500 mb-4">
            @{profileUser.username || `${profileUser.firstName}${profileUser.lastName}`.toLowerCase()}
          </p>
          
          {!isOwnProfile && (
            <div className="flex gap-3 mb-6">
              <FollowButton 
                isFollowing={isFollowing} 
                targetUserId={user_id}
              />
              <Link href={`/messages?user=${user_id}`}>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </Link>
            </div>
          )}
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">
              {profileUser.publicMetadata?.bio as string || 
                `This is ${profileUser.firstName}&apos;s profile on LinkedIn Clone.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default UserPage;