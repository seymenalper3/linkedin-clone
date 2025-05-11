import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import FollowButton from "@/components/FollowButton";
import { redirect } from "next/navigation";

async function NetworkPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-800">
          Please sign in to view your network
        </h1>
      </div>
    );
  }

  // Handle action query parameters
  const action = searchParams.action;
  const targetUserId = searchParams.targetUserId as string;
  const connectWith = searchParams.connectWith as string;

  // If there's a connectWith parameter, redirect to that user's profile
  if (connectWith) {
    redirect(`/users/${connectWith}`);
  }

  // Fetch followers and following directly from the database
  const baseUrl = "http://localhost:3002";
  const followersRes = await fetch(
    `${baseUrl}/api/followers?user_id=${userId}`,
    { cache: "no-store" }
  );
  const followingRes = await fetch(
    `${baseUrl}/api/following?user_id=${userId}`,
    { cache: "no-store" }
  );

  const followers = await followersRes.json();
  const following = await followingRes.json();

  // Fetch user information for followers and following
  const followerUsers = [];
  const followingUsers = [];

  if (Array.isArray(followers)) {
    for (const follower of followers) {
      try {
        const followerUser = await clerkClient.users.getUser(follower.follower);
        followerUsers.push({
          ...follower,
          user: followerUser
        });
      } catch (error) {
        console.error("Error fetching follower user:", error);
      }
    }
  }

  if (Array.isArray(following)) {
    for (const followingItem of following) {
      try {
        const followingUser = await clerkClient.users.getUser(followingItem.following);
        followingUsers.push({
          ...followingItem,
          user: followingUser
        });
      } catch (error) {
        console.error("Error fetching following user:", error);
      }
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 mt-5">
      <h1 className="text-2xl font-bold mb-4">My Network</h1>
      
      <Tabs defaultValue="followers">
        <TabsList className="mb-4">
          <TabsTrigger value="followers">
            Followers ({followerUsers.length || 0})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({followingUsers.length || 0})
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="followers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followerUsers.length > 0 ? (
              followerUsers.map((item: any) => (
                <div key={item._id} className="p-4 border rounded-lg shadow-sm bg-white flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.user.imageUrl} />
                    <AvatarFallback>
                      {item.user.firstName?.[0]}
                      {item.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.user.firstName} {item.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">@{item.user.username || `${item.user.firstName?.toLowerCase()}${item.user.lastName?.toLowerCase()}`}</p>
                    
                    <div className="mt-3 flex gap-2">
                      <Link href={`/users/${item.user.id}`}>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-4">You don't have any followers yet.</p>
                  <Link href="/users">
                    <Button className="bg-[#0B63C4]">Find People</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="following">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followingUsers.length > 0 ? (
              followingUsers.map((item: any) => (
                <div key={item._id} className="p-4 border rounded-lg shadow-sm bg-white flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.user.imageUrl} />
                    <AvatarFallback>
                      {item.user.firstName?.[0]}
                      {item.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.user.firstName} {item.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">@{item.user.username || `${item.user.firstName?.toLowerCase()}${item.user.lastName?.toLowerCase()}`}</p>
                    
                    <div className="mt-3 flex gap-2">
                      <FollowButton 
                        isFollowing={true} 
                        targetUserId={item.user.id}
                      />
                      <Link href={`/users/${item.user.id}`}>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-4">You're not following anyone yet.</p>
                  <Link href="/users">
                    <Button className="bg-[#0B63C4]">Find People</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="suggestions">
          <div className="col-span-2">
            <p className="text-gray-700 mb-4">Find more people to connect with:</p>
            <Link href="/users">
              <Button className="bg-[#0B63C4]">
                <UserPlus className="h-4 w-4 mr-2" />
                Find People
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NetworkPage;