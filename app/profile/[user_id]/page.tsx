import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";
import { clerkClient } from "@clerk/nextjs";
import PublicProfile from "@/components/profile/PublicProfile";
import { Post } from "@/mongodb/models/post";

export default async function UserProfilePage({
  params,
}: {
  params: { user_id: string };
}) {
  // Get the target user ID from the URL
  const { user_id: targetUserId } = params;
  
  // Get current user for permission checks
  const currentUserData = await currentUser();
  
  try {
    // Get Clerk user data
    const clerkUserData = await clerkClient.users.getUser(targetUserId);
    
    if (!clerkUserData) {
      return notFound();
    }
    
    // Connect to MongoDB
    await connectDB();
    
    // Get user's profile data
    let profile = await Profile.findOne({ userId: targetUserId });
    
    // If no profile exists, create a blank structure for display
    if (!profile) {
      profile = {
        userId: targetUserId,
        education: [],
        experience: [],
        skills: []
      };
    }
    
    // Get user's posts
    const posts = await Post.find({ "user.userId": targetUserId })
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
      })
      .limit(10);
    
    // Prepare user data for display
    const userData = {
      id: clerkUserData.id,
      firstName: clerkUserData.firstName || "",
      lastName: clerkUserData.lastName || "",
      imageUrl: clerkUserData.imageUrl,
    };
    
    // Check if this is the current user's profile
    const isOwnProfile = currentUserData?.id === targetUserId;
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PublicProfile 
          profile={JSON.parse(JSON.stringify(profile))}
          user={userData}
          isOwnProfile={isOwnProfile}
          posts={JSON.parse(JSON.stringify(posts))}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return notFound();
  }
}