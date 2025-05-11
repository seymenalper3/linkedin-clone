import { NextRequest, NextResponse } from "next/server";

export function adminMiddleware(req: NextRequest) {
  // Setup sayfasına erişime izin ver
  if (req.nextUrl.pathname === "/admin/setup") {
    return NextResponse.next();
  }

  // Auth kontrolünü sayfa içinde yapacağız
  // Middleware'de sadece erişim kontrolü yapıyoruz
  return NextResponse.next();
}