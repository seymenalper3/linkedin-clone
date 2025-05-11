import { auth, currentUser } from "@clerk/nextjs/server";
import React from "react";
import UserCard from "@/components/UserCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function NetworkPage() {
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

  // Fetch followers and following from the API routes we already have
  const followersRes = await fetch(
    `${process.env.NEXT_PUBLIC_URL || ""}/api/followers?user_id=${userId}`,
    { cache: "no-store" }
  );
  const followingRes = await fetch(
    `${process.env.NEXT_PUBLIC_URL || ""}/api/following?user_id=${userId}`,
    { cache: "no-store" }
  );

  const followers = await followersRes.json();
  const following = await followingRes.json();

  return (
    <div className="bg-white rounded-lg border p-6 mt-5">
      <h1 className="text-2xl font-bold mb-4">My Network</h1>
      
      <Tabs defaultValue="followers">
        <TabsList className="mb-4">
          <TabsTrigger value="followers">
            Followers ({followers.length || 0})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({following.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="followers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followers.length > 0 ? (
              followers.map((follower: any) => (
                <UserCard 
                  key={follower._id} 
                  userId={follower.follower} 
                  relationship="follower"
                />
              ))
            ) : (
              <p className="text-gray-500">You don't have any followers yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="following">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {following.length > 0 ? (
              following.map((followingUser: any) => (
                <UserCard 
                  key={followingUser._id} 
                  userId={followingUser.following} 
                  relationship="following"
                />
              ))
            ) : (
              <p className="text-gray-500">You're not following anyone yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NetworkPage;