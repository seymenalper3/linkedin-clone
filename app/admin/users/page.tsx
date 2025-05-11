import React from 'react';
import { clerkClient } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Mail } from "lucide-react";
import Link from "next/link";

export default async function UsersManagement() {
  // Clerk API'den tüm kullanıcıları getir
  let users = [];
  try {
    users = await clerkClient.users.getUserList();
  } catch (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h1>
      
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Tüm Kullanıcılar</h2>
          <p className="text-sm text-gray-500">Sisteme kayıtlı olan tüm kullanıcılar ({users.length})</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Avatar>
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>
                            {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username || `${user.firstName?.toLowerCase() || 'user'}${user.id.slice(-4)}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.emailAddresses[0]?.emailAddress || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.banned ? 'Yasaklı' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/users/${user.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          Profil
                        </Button>
                      </Link>
                      <form action={`/api/admin/users/${user.id}/toggle-ban`} method="POST">
                        <Button type="submit" variant="outline" size="sm" className={user.banned ? "text-green-600" : "text-red-600"}>
                          {user.banned ? <UserCheck size={16} className="mr-1" /> : <UserX size={16} className="mr-1" />}
                          {user.banned ? 'Ban Kaldır' : 'Yasakla'}
                        </Button>
                      </form>
                      <Button variant="outline" size="sm" className="text-blue-600">
                        <Mail size={16} className="mr-1" />
                        Email
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Kullanıcı bulunamadı.
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