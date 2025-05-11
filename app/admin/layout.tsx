import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  // Setup sayfasına özel durum - database'de hiç admin yoksa setup sayfasına izin ver
  const isSetupPage = false; // Sadece setup sayfasında true olacak şekilde her sayfada kontrol edeceğiz
  if (isSetupPage) {
    try {
      await connectDB();
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        return <>{children}</>;
      }
    } catch (error) {
      console.error("Error checking admin count:", error);
    }
  }

  // Admin kontrolü
  try {
    await connectDB();
    const isAdmin = await Admin.isUserAdmin(userId);

    if (!isAdmin) {
      redirect("/");
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-[#0B63C4] text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">LinkedIn Clone Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:underline">Ana Sayfa</Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Sidebar and Content */}
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
          <nav className="space-y-2">
            <Link 
              href="/admin" 
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/users" 
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Kullanıcı Yönetimi
            </Link>
            <Link 
              href="/admin/posts" 
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Post Yönetimi
            </Link>
            <Link 
              href="/admin/admins" 
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Admin Yönetimi
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {children}
        </main>
      </div>
    </div>
  );
}