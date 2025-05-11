import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export async function adminMiddleware(req: NextRequest) {
  const { userId } = auth();

  // Kullanıcı giriş yapmamışsa admin paneline erişim izni yok
  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Veritabanına bağlan
    await connectDB();

    // Kullanıcının admin olup olmadığını kontrol et
    const isAdmin = await Admin.isUserAdmin(userId);

    // Admin değilse ana sayfaya yönlendir
    if (!isAdmin) {
      console.log(`User ${userId} attempted to access admin panel but is not an admin`);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Admin ise devam et
    return NextResponse.next();
    
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}