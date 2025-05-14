import { IPostDocument } from "@/mongodb/models/post";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Use dynamic import for client component to avoid hydration issues
const UserInformationClient = dynamic(() => import("./UserInformationClient"), { ssr: false });

// This is a server component that fetches the necessary data 
// and passes it to the client component
async function UserInformation({ posts }: { posts: IPostDocument[] }) {
  return (
    <Suspense fallback={
      <div className="card flex flex-col justify-center items-center mr-6 p-6 animate-pulse">
        <div className="h-20 w-20 rounded-full bg-muted mb-5"></div>
        <div className="w-32 h-5 bg-muted rounded mb-2"></div>
        <div className="w-24 h-4 bg-muted rounded mb-3"></div>
        <div className="w-16 h-6 bg-muted rounded"></div>
      </div>
    }>
      <UserInformationClient posts={posts} />
    </Suspense>
  );
}

export default UserInformation;
