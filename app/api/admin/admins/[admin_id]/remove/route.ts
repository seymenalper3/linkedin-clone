import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export async function POST(
  request: Request,
  { params }: { params: { admin_id: string } }
) {
  const { userId } = auth();
  const adminId = params.admin_id;

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

    // Kaldırılacak admini bul
    const adminToRemove = await Admin.findById(adminId);
    
    if (!adminToRemove) {
      return NextResponse.json({ error: "Admin bulunamadı" }, { status: 404 });
    }

    // Admin kendisini silmeye çalışıyorsa engelle
    if (adminToRemove.userId === userId) {
      return NextResponse.json({ 
        error: "Kendi admin yetkinizi kaldıramazsınız" 
      }, { status: 400 });
    }

    // Admini kaldır
    await adminToRemove.removeAdmin();

    return NextResponse.json({ 
      message: "Admin yetkisi başarıyla kaldırıldı"
    });
  } catch (error) {
    console.error("Error removing admin:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}