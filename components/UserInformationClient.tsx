"use client";

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Badge } from "./ui/badge";
import { UserRole } from "@/types/user";
import { IPostDocument } from "@/mongodb/models/post";
import RoleChangeModal from "./RoleChangeModal";
import Link from "next/link";

// Interface for Clerk user
interface ClerkUser {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}

export default function UserInformationClient({ posts }: { posts: IPostDocument[] }) {
  // State for user information
  const [user, setUser] = useState<ClerkUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Memoize filtered posts and comments based on user ID
  const userPosts = useMemo(() => 
    posts?.filter((post) => post.user.userId === user?.id) || [], 
    [posts, user?.id]
  );
  
  const userComments = useMemo(() => 
    posts?.flatMap(
      (post) =>
        post?.comments?.filter((comment) => comment.user.userId === user?.id) || []
    ) || [],
    [posts, user?.id]
  );

  // Fetch user and role data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Fetch Clerk user
        const userResponse = await fetch('/api/users/current');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          
          if (userData.user) {
            setUser({
              id: userData.user.id,
              firstName: userData.user.firstName,
              lastName: userData.user.lastName,
              imageUrl: userData.user.imageUrl
            });

            // Fetch user role from database if user is signed in
            const roleResponse = await fetch('/api/users/check-role');
            if (roleResponse.ok) {
              const roleData = await roleResponse.json();
              setUserRole(roleData.role || 'employee'); // Default to employee if no role set
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Role change handler
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
  };

  if (isLoading) {
    return (
      <div className="card flex flex-col justify-center items-center mr-6 p-6 animate-pulse">
        <div className="h-20 w-20 rounded-full bg-muted mb-5"></div>
        <div className="w-32 h-5 bg-muted rounded mb-2"></div>
        <div className="w-24 h-4 bg-muted rounded mb-3"></div>
        <div className="w-16 h-6 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col justify-center items-center mr-6 p-6">
      <Avatar className="h-20 w-20 mb-5 avatar-linkedin">
        {user?.id ? (
          <AvatarImage src={user.imageUrl} />
        ) : (
          <AvatarImage src="https://github.com/shadcn.png" />
        )}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {user?.firstName?.charAt(0) || ""}
          {user?.lastName?.charAt(0) || ""}
        </AvatarFallback>
      </Avatar>

      <SignedIn>
        <div className="text-center">
          <p className="font-semibold text-lg text-card-foreground/90">
            {user?.firstName} {user?.lastName}
          </p>

          <div className="text-xs text-muted-foreground mt-1">
            @{user?.firstName}
            {user?.lastName}-{user?.id?.slice(-4)}
          </div>

          {/* Role badge with click handler */}
          {userRole && (
            <Badge
              variant="outline"
              className={`mt-2 cursor-pointer hover:opacity-80 transition-opacity ${
                userRole === 'employer'
                  ? 'bg-secondary/10 text-secondary border-secondary/20'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}
              onClick={() => setShowRoleModal(true)}>
              {userRole === 'employer' ? 'Employer' : 'Employee'} ✏️
            </Badge>
          )}

          {/* Role change modal */}
          {showRoleModal && (
            <RoleChangeModal
              currentRole={userRole}
              onClose={() => setShowRoleModal(false)}
              onRoleChanged={handleRoleChange}
            />
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <div className="text-center space-y-3">
          <p className="font-semibold text-card-foreground/90">You are not signed in</p>

          <Button asChild className="btn-linkedin">
            <SignInButton>Sign in</SignInButton>
          </Button>
        </div>
      </SignedOut>

      <div className="w-full border-t border-border my-5"></div>

      <div className="flex justify-between w-full px-1 text-sm py-1.5">
        <p className="font-medium text-muted-foreground">Posts</p>
        <p className="text-primary font-semibold">{userPosts.length}</p>
      </div>

      <div className="flex justify-between w-full px-1 text-sm py-1.5">
        <p className="font-medium text-muted-foreground">Comments</p>
        <p className="text-primary font-semibold">{userComments.length}</p>
      </div>

      <div className="flex justify-between w-full px-1 text-sm py-1.5">
        <p className="font-medium text-muted-foreground">Network</p>
        <p className="text-primary font-semibold">
          <a href="/network" className="hover:underline">View</a>
        </p>
      </div>

      <div className="flex justify-between w-full px-1 text-sm py-1.5">
        <p className="font-medium text-muted-foreground">Profile</p>
        <p className="text-primary font-semibold">
          {user?.id && (
            <Link href={`/profile/edit`} className="hover:underline">Edit</Link>
          )}
        </p>
      </div>
    </div>
  );
}