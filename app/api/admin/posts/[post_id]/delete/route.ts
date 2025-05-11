import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Admin } from "@/mongodb/models/admin";
import { Post } from "@/mongodb/models/post";

export async function POST(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  const { userId } = auth();
  const postId = params.post_id;

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

    // Postu bul
    const post = await Post.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }

    // Postu sil
    await post.removePost();

    return NextResponse.json({ 
      message: "Post başarıyla silindi"
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}