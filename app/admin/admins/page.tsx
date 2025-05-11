import React from 'react';
import { Admin } from '@/mongodb/models/admin';
import { clerkClient } from "@clerk/nextjs/server";
import connectDB from '@/mongodb/db';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, UserPlus } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function AdminsManagement() {
  await connectDB();
  const { userId } = auth();
  
  // Tüm adminleri getir
  let admins = [];
  try {
    admins = await Admin.getAllAdmins();
  } catch (error) {
    console.error("Error fetching admins:", error);
  }

  // Admin kullanıcı detaylarını getir
  const adminDetails = [];
  for (const admin of admins) {
    try {
      const user = await clerkClient.users.getUser(admin.userId);
      adminDetails.push({
        ...admin,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0]?.emailAddress
        }
      });
    } catch (error) {
      console.error(`Error fetching admin user details for ${admin.userId}:`, error);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Yönetimi</h1>
      
      {/* Admin Ekleme Formu */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Yeni Admin Ekle</h2>
          <p className="text-sm text-gray-500">Sisteme yeni bir admin yetkilisi ekleyin</p>
        </div>
        
        <form className="p-6" action="/api/admin/admins/add" method="POST">
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı ID
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              required
              placeholder="Clerk kullanıcı ID'si (user_xxxxx)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Bu, Clerk tarafından oluşturulan kullanıcı ID'sidir (örn: user_2wx7R3ZDaVmG0e1fGCZDvjxWxgv)
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" className="bg-[#0B63C4]">
              <UserPlus size={16} className="mr-2" />
              Admin Ekle
            </Button>
          </div>
        </form>
      </div>
      
      {/* Adminler Listesi */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Mevcut Adminler</h2>
          <p className="text-sm text-gray-500">Sistemdeki tüm admin yetkileri ({adminDetails.length})</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ekleme Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminDetails.map((admin) => (
                <tr key={admin._id.toString()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Avatar>
                          <AvatarImage src={admin.user.imageUrl} />
                          <AvatarFallback>
                            {admin.user.firstName?.[0] || ''}{admin.user.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.user.firstName} {admin.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {admin.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(admin.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* Kendini silemesin */}
                    {userId !== admin.userId && (
                      <form action={`/api/admin/admins/${admin._id}/remove`} method="POST">
                        <Button type="submit" variant="outline" size="sm" className="text-red-600">
                          <Trash2 size={16} className="mr-1" />
                          Yetkiyi Kaldır
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              
              {adminDetails.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Henüz admin bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}