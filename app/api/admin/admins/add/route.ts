import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Veritabanına bağlan
    await connectDB();

    // İstek yapan kullanıcının admin olup olmadığını kontrol et
    const isAdmin = await Admin.isUserAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    // Form verilerini al
    const formData = await request.formData();
    const newAdminUserId = formData.get("userId") as string;
    const email = formData.get("email") as string;

    if (!newAdminUserId || !email) {
      return NextResponse.json({ error: "User ID ve email alanları gerekli" }, { status: 400 });
    }

    // Kullanıcının varlığını kontrol et
    try {
      await clerkClient.users.getUser(newAdminUserId);
    } catch (error) {
      return NextResponse.json({ error: "Geçersiz kullanıcı ID" }, { status: 400 });
    }

    // Kullanıcının zaten admin olup olmadığını kontrol et
    const existingAdmin = await Admin.findOne({ userId: newAdminUserId });
    if (existingAdmin) {
      return NextResponse.json({ error: "Bu kullanıcı zaten admin" }, { status: 400 });
    }

    // Yeni admin oluştur
    const newAdmin = await Admin.create({
      userId: newAdminUserId,
      email,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      message: "Admin başarıyla eklendi", 
      admin: newAdmin 
    });
  } catch (error) {
    console.error("Error adding admin:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}