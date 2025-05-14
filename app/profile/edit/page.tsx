import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileEditForm from "@/components/ProfileEditForm";
import { Profile } from "@/mongodb/models/profile";
import connectDB from "@/mongodb/db";

export default async function ProfileEditPage() {
  // Check authentication
  const { userId } = auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect("/");
  }
  
  // Connect to database
  await connectDB();
  
  // Get user's profile data
  let profile = await Profile.findOne({ userId });
  
  // If no profile exists, create a blank one with correct type
  if (!profile) {
    profile = new Profile({
      userId,
      headline: "",
      about: "",
      location: "",
      website: "",
      education: [],
      experience: [],
      skills: []
    });
    // Don't save yet - will be handled when user submits the form
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Your Profile</h1>
      
      <ProfileEditForm 
        initialProfile={JSON.parse(JSON.stringify(profile))} 
        user={{
          id: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl
        }}
      />
    </div>
  );
}