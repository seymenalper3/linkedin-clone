import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchIcon, UserPlus } from "lucide-react";
import FollowButton from "@/components/FollowButton";

async function UsersPage({ searchParams }: { searchParams: { search?: string } }) {
  const { userId } = auth();
  const user = await currentUser();
  const searchQuery = searchParams.search || "";

  if (!userId || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-800">
          Please sign in to view users
        </h1>
      </div>
    );
  }

  // Get all users from Clerk
  const users = await clerkClient.users.getUserList({
    limit: 50,
  });

  // Filter out the current user and apply search if provided
  // Make sure users is an array before filtering
  let otherUsers = Array.isArray(users) 
    ? users.filter((u) => u.id !== userId)
    : (users?.data?.filter((u) => u.id !== userId) || []);
    
  // Apply search filtering if a search query is provided
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    otherUsers = otherUsers.filter(user => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const username = (user.username || "").toLowerCase();
      return fullName.includes(query) || username.includes(query);
    });
  }

  return (
    <div className="bg-white rounded-lg border p-6 mt-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Find People to Connect With</h1>
        
        {searchQuery && (
          <div className="bg-accent/50 py-1.5 px-3 rounded-full flex items-center text-sm">
            <SearchIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <span>
              Search: <span className="font-medium">{searchQuery}</span> 
              <span className="text-muted-foreground ml-2">({otherUsers.length} results)</span>
            </span>
          </div>
        )}
      </div>
      
      {searchQuery && otherUsers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No users found matching &quot;{searchQuery}&quot;</p>
          <Link href="/users">
            <Button variant="outline">Clear Search</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherUsers.map((otherUser) => (
          <div key={otherUser.id} className="border rounded-lg p-4 flex flex-col items-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={otherUser.imageUrl} alt={otherUser.firstName || 'User'} />
              <AvatarFallback>
                {otherUser.firstName?.[0]}
                {otherUser.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold text-center">
              {otherUser.firstName} {otherUser.lastName}
            </h2>
            <p className="text-sm text-gray-500 mb-4">@{otherUser.username || `${otherUser.firstName}${otherUser.lastName}`.toLowerCase()}</p>
            
            <div className="flex gap-3 mt-2">
              <Link href={`/profile/${otherUser.id}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
              <FollowButton targetUserId={otherUser.id} isFollowing={false} />
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default UsersPage;