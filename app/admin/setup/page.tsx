"use client";

import React, { useState } from 'react';
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function AdminSetup() {
  const { user, isLoaded } = useUser();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("email", email);

      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      setSuccess(data.message);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error: any) {
      setError(error?.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0B63C4] text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">LinkedIn Clone Admin Kurulumu</h1>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">İlk Admin Kurulumu</h2>
          
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6">
              {success}
              <p className="mt-2 text-sm">Admin paneline yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                LinkedIn Clone uygulamanız için ilk admin kullanıcısını oluşturmak üzeresiniz. 
                Bu işlem sadece bir kez yapılabilir. Daha sonra diğer adminleri admin paneli 
                üzerinden ekleyebilirsiniz.
              </p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Bu, yönetici hesabınız için kullanılacak e-posta adresidir.
                  </p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Admin ID:</strong> {user?.id}<br />
                    <strong>Ad Soyad:</strong> {user?.fullName}
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#0B63C4]"
                    disabled={isLoading}
                  >
                    {isLoading ? "İşleniyor..." : "Admin Olarak Ayarla"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}