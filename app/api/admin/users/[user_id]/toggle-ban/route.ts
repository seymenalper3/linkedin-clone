import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";

export async function POST(
  request: Request,
  { params }: { params: { user_id: string } }
) {
  const { userId } = auth();
  const targetUserId = params.user_id;

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

    // Kullanıcı bilgilerini al
    const user = await clerkClient.users.getUser(targetUserId);

    // Kullanıcının etkin durumunu kontrol et
    const currentlyActive = user.publicMetadata?.active !== false;

    // Kullanıcının aktif durumunu değiştir - publicMetadata içinde 'active' alanını kullanıyoruz
    const updatedUser = await clerkClient.users.updateUser(targetUserId, {
      publicMetadata: {
        ...user.publicMetadata,
        active: !currentlyActive
      },
    });

    const isNowActive = (updatedUser.publicMetadata as any)?.active !== false;

    return NextResponse.json({
      message: isNowActive ? "Kullanıcı aktifleştirildi" : "Kullanıcı devre dışı bırakıldı",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error toggling user ban status:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}