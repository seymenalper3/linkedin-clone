import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function adminMiddleware(req: NextRequest) {
  const { userId } = auth();

  // Kullanıcı giriş yapmamışsa admin paneline erişim izni yok
  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Setup sayfasına erişime izin ver
  if (req.nextUrl.pathname === "/admin/setup") {
    return NextResponse.next();
  }

  // Diğer admin sayfaları için admin kontrolünü sayfa içinde yapacağız
  // Middleware'de sadece giriş kontrolü yapıyoruz
  return NextResponse.next();
}