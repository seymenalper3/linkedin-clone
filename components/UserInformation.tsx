import { currentUser } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { IPostDocument } from "@/mongodb/models/post";
import { Button } from "./ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Badge } from "./ui/badge";
import mongoose from "mongoose";
import connectDB from "@/mongodb/db";

async function UserInformation({ posts }: { posts: IPostDocument[] }) {
  const user = await currentUser();

  const firstName = user?.firstName as string;
  const lastName = user?.lastName as string;
  const imageUrl = user?.imageUrl as string;

  // Fetch user role from database if user is signed in
  let userRole = null;
  if (user?.id) {
    try {
      await connectDB();
      const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
        userId: String,
        role: String,
      }));

      const dbUser = await User.findOne({ userId: user.id });
      userRole = dbUser?.role;
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  }

  const userPosts = posts?.filter((post) => post.user.userId === user?.id);

  //  The flatMap() method creates a new array by calling a function for each element in the array and then flattening the result into a new array. It is identical to a map() followed by a flat() of depth 1, but flatMap() is often quite useful, as merging both into one method is slightly more efficient. The result of this flatMap() is a new array that contains all comments made by the current user across all posts. It's "flat" because it's a single-level array, not an array of arrays.
  const userComments = posts.flatMap(
    (post) =>
      post?.comments?.filter((comment) => comment.user.userId === user?.id) ||
      []
  );

  return (
    <div className="card flex flex-col justify-center items-center mr-6 p-6">
      <Avatar className="h-20 w-20 mb-5 avatar-linkedin">
        {user?.id ? (
          <AvatarImage src={imageUrl} />
        ) : (
          <AvatarImage src="https://github.com/shadcn.png" />
        )}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {firstName?.charAt(0)}
          {lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <SignedIn>
        <div className="text-center">
          <p className="font-semibold text-lg text-card-foreground/90">
            {firstName} {lastName}
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            @{firstName}
            {lastName}-{user?.id?.slice(-4)}
          </p>

          {userRole && (
            <Badge
              variant="outline"
              className={`mt-2 ${userRole === 'employer'
                ? 'bg-secondary/10 text-secondary border-secondary/20'
                : 'bg-primary/10 text-primary border-primary/20'}`}>
              {userRole === 'employer' ? 'Employer' : 'Employee'}
            </Badge>
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
    </div>
  );
}

export default UserInformation;
