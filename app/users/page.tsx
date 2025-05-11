import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

async function UsersPage() {
  const { userId } = auth();
  const user = await currentUser();

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

  // Filter out the current user
  // Make sure users is an array before filtering
  const otherUsers = Array.isArray(users) 
    ? users.filter((u) => u.id !== userId)
    : (users?.data?.filter((u) => u.id !== userId) || []);

  return (
    <div className="bg-white rounded-lg border p-6 mt-5">
      <h1 className="text-2xl font-bold mb-6">Find People to Connect With</h1>
      
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
              <Link href={`/users/${otherUser.id}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
              <Link href={`/network?connectWith=${otherUser.id}`}>
                <Button className="bg-[#0B63C4]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UsersPage;