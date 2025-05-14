import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";
import { clerkClient } from "@clerk/nextjs/server";
import PublicProfile from "@/components/profile/PublicProfile";
import { Post } from "@/mongodb/models/post";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function UserProfilePage({
  params,
}: {
  params: { user_id: string };
}) {
  // Get the target user ID from the URL
  const { user_id: targetUserId } = params;
  
  if (!targetUserId) {
    console.error("No user ID provided in URL");
    return renderErrorPage("Invalid profile URL", "No user ID was provided.");
  }
  
  // Get current user for permission checks
  let currentUserData;
  try {
    currentUserData = await currentUser();
  } catch (error) {
    console.error("Error fetching current user:", error);
    // Continue without current user - will just affect "edit" button visibility
  }
  
  try {
    // Connect to MongoDB early
    try {
      await connectDB();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return renderErrorPage(
        "Database connection error", 
        "We're having trouble connecting to our database. Please try again later."
      );
    }
    
    // Try to get data from MongoDB first to work around Clerk issues
    let userData: { id: string; firstName: string; lastName: string; imageUrl: string } | undefined;
    let userPosts: any[] = [];
    let userProfile: any;

    // Get user's posts - this will give us basic user info even if Clerk fails
    try {
      userPosts = await Post.find({ "user.userId": targetUserId })
        .sort({ createdAt: -1 })
        .populate({
          path: "comments",
          options: { sort: { createdAt: -1 } },
        })
        .limit(10);
      
      // If we have posts, we can extract user data from the first post
      if (userPosts && userPosts.length > 0) {
        const firstPost = userPosts[0];
        userData = {
          id: firstPost.user.userId,
          firstName: firstPost.user.firstName || "Unknown",
          lastName: firstPost.user.lastName || "User",
          imageUrl: firstPost.user.userImage || "",
        };
        console.log(`Found user data from posts: ${userData.firstName} ${userData.lastName}`);
      }
    } catch (postsError) {
      console.error("Error fetching user posts:", postsError);
      // Continue without posts
    }
    
    // Get user's profile data
    try {
      userProfile = await Profile.findOne({ userId: targetUserId });
      
      // If no profile exists, create a blank structure for display
      if (!userProfile) {
        userProfile = {
          userId: targetUserId,
          education: [],
          experience: [],
          skills: []
        };
      }
      console.log(`Found user profile: ${userProfile.userId}`);
    } catch (profileError) {
      console.error("Error fetching profile data:", profileError);
      // Create empty profile
      userProfile = {
        userId: targetUserId,
        education: [],
        experience: [],
        skills: []
      };
    }
    
    // Try to get user data from Clerk if we don't have it from posts
    if (!userData) {
      try {
        console.log(`Attempting to fetch Clerk user with ID: ${targetUserId}`);
        
        // Check if targetUserId is valid format
        if (!targetUserId || typeof targetUserId !== 'string' || targetUserId.length < 5) {
          console.error(`Invalid user ID format: ${targetUserId}`);
          // If we have no user data at all, show error
          if (!userData) {
            return renderErrorPage(
              "Invalid user ID", 
              `The user ID format appears to be invalid: ${targetUserId.slice(0, 10)}...`
            );
          }
        }
        
        const clerkUserData = await clerkClient.users.getUser(targetUserId).catch(error => {
          console.error(`Clerk API rejected user ID ${targetUserId}: ${error.message || 'Unknown error'}`);
          throw error;
        });
        
        if (clerkUserData) {
          console.log(`Successfully fetched Clerk user: ${clerkUserData.id}, Name: ${clerkUserData.firstName} ${clerkUserData.lastName}`);
          userData = {
            id: clerkUserData.id,
            firstName: clerkUserData.firstName || "Unknown",
            lastName: clerkUserData.lastName || "User",
            imageUrl: clerkUserData.imageUrl || "",
          };
        }
      } catch (clerkError: any) {
        console.error(`Error fetching user from Clerk: ${targetUserId}`, clerkError);
        console.error(`Error type: ${typeof clerkError}, message: ${clerkError?.message || 'No message'}`);
        
        // Only show error if we have no user data at all
        if (!userData) {
          // Create fallback user data based on ID
          userData = {
            id: targetUserId,
            firstName: "User",
            lastName: targetUserId.slice(-4),
            imageUrl: `https://ui-avatars.com/api/?name=User+${targetUserId.slice(-4)}&background=random`,
          };
          
          console.log(`Created fallback user data: ${userData.firstName} ${userData.lastName}`);
        }
      }
    }
    
    // As a final fallback if we still don't have user data
    if (!userData) {
      userData = {
        id: targetUserId,
        firstName: "User",
        lastName: targetUserId.slice(-4),
        imageUrl: `https://ui-avatars.com/api/?name=User+${targetUserId.slice(-4)}&background=random`,
      };
      console.log(`Created last-resort fallback user data: ${userData.firstName} ${userData.lastName}`);
    }
    
    // Check if this is the current user's profile
    const isOwnProfile = currentUserData?.id === targetUserId;
    
    // Safely serialize data to prevent circular reference errors
    let serializedProfile;
    let serializedPosts;
    
    try {
      serializedProfile = JSON.parse(JSON.stringify(userProfile));
      serializedPosts = JSON.parse(JSON.stringify(userPosts));
    } catch (serializeError) {
      console.error("Error serializing data:", serializeError);
      // Use simplified data if serialization fails
      serializedProfile = {
        userId: userProfile.userId,
        education: [],
        experience: [],
        skills: []
      };
      serializedPosts = [];
    }
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PublicProfile 
          profile={serializedProfile}
          user={userData}
          isOwnProfile={isOwnProfile}
          posts={serializedPosts}
        />
      </div>
    );
  } catch (error) {
    console.error("Unhandled error in profile page:", error);
    return renderErrorPage(
      "Something went wrong", 
      "We encountered an unexpected error while loading this profile. Please try again later."
    );
  }
}

// Helper function to render error pages
function renderErrorPage(title: string, message: string) {
  return (
    <div className="bg-white rounded-lg border shadow-md p-8 mt-8 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">{title}</h1>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-center gap-4">
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
        <Link href="/users">
          <Button variant="outline">View All Users</Button>
        </Link>
      </div>
    </div>
  );
}