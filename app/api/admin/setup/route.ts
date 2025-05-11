import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export async function POST(request: Request) {
  const { userId } = auth();

  console.log("Admin setup attempt by user:", userId);

  if (!userId) {
    console.log("Admin setup rejected: No authenticated user");
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  try {
    // Veritabanına bağlan
    console.log("Connecting to MongoDB");
    await connectDB();

    // Admin sayısını kontrol et
    console.log("Checking admin count");
    const adminCount = await Admin.countDocuments();
    console.log("Current admin count:", adminCount);

    // Eğer zaten admin varsa engelle
    if (adminCount > 0) {
      console.log("Admin setup rejected: Admins already exist");
      return NextResponse.json({
        error: "İlk admin zaten oluşturulmuş. Yeni admin eklemek için admin panelini kullanın."
      }, { status: 400 });
    }

    // Form verilerini al
    console.log("Processing form data");
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
      console.log("Admin setup rejected: Email field missing");
      return NextResponse.json({ error: "Email alanı gerekli" }, { status: 400 });
    }

    console.log("Creating first admin with email:", email);
    // İlk admini ekle
    await Admin.create({
      userId,
      email,
      createdAt: new Date()
    });

    console.log("Admin created successfully");
    return NextResponse.json({
      message: "İlk admin başarıyla oluşturuldu. Artık admin paneline erişebilirsiniz.",
      redirectUrl: "/admin"
    });
  } catch (error) {
    console.error("Error setting up initial admin:", error);
    return NextResponse.json({
      error: `Bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
}