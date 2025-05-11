import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export async function GET(request: Request) {
  // Sanity check - process environment
  const environment = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  try {
    // Check auth
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: "Authentication required",
        environment
      }, { status: 401 });
    }

    // Connect to database
    console.log("Connecting to MongoDB");
    await connectDB();

    // Check admin count
    console.log("Checking admin count");
    const adminCount = await Admin.countDocuments();
    console.log("Current admin count:", adminCount);

    // Get current user from clerk
    const searchParams = new URL(request.url).searchParams;
    const email = searchParams.get('email') || 'default@example.com';
    const forceCreate = searchParams.get('force') === 'true';

    // Check if user is already admin
    const isAdmin = await Admin.isUserAdmin(userId);

    // If admins already exist and not forcing creation
    if (adminCount > 0 && !forceCreate) {
      return NextResponse.json({
        message: "Admins already exist",
        isCurrentUserAdmin: isAdmin,
        adminCount,
        userId,
        email,
        environment,
        tip: "Add ?force=true to force create admin"
      });
    }

    // Create admin
    if (forceCreate || adminCount === 0) {
      console.log("Creating admin with email:", email);
      const admin = await Admin.create({
        userId,
        email,
        createdAt: new Date()
      });

      return NextResponse.json({
        message: "Admin created successfully!",
        admin: {
          id: admin._id,
          userId: admin.userId,
          email: admin.email,
          createdAt: admin.createdAt
        },
        environment,
        nextSteps: "You can now access the admin panel at /admin"
      });
    }

    return NextResponse.json({
      message: "Debug completed",
      adminCount,
      isAdmin,
      userId,
      environment
    });
  } catch (error) {
    console.error("Admin debug error:", error);
    return NextResponse.json({
      error: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      environment
    }, { status: 500 });
  }
}