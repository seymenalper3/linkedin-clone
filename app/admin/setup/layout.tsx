import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  // Check if there are no admins yet
  try {
    await connectDB();
    const adminCount = await Admin.countDocuments();
    
    // If admins already exist, redirect to main admin page
    if (adminCount > 0) {
      // Check if the current user is an admin
      const isAdmin = await Admin.isUserAdmin(userId);
      if (isAdmin) {
        redirect("/admin");
      } else {
        redirect("/");
      }
    }
  } catch (error) {
    console.error("Error checking admin count:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0B63C4] text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">LinkedIn Clone Admin Setup</h1>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6 px-4">
        {children}
      </div>
    </div>
  );
}