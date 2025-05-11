import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  try {
    // Veritabanına bağlan
    await connectDB();

    // Admin sayısını kontrol et
    const adminCount = await Admin.countDocuments();
    
    // Eğer zaten admin varsa engelle
    if (adminCount > 0) {
      return NextResponse.json({ 
        error: "İlk admin zaten oluşturulmuş. Yeni admin eklemek için admin panelini kullanın." 
      }, { status: 400 });
    }

    // Form verilerini al
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
      return NextResponse.json({ error: "Email alanı gerekli" }, { status: 400 });
    }

    // İlk admini ekle
    await Admin.create({
      userId,
      email,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      message: "İlk admin başarıyla oluşturuldu. Artık admin paneline erişebilirsiniz.",
      redirectUrl: "/admin"
    });
  } catch (error) {
    console.error("Error setting up initial admin:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}