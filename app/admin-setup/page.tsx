"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

export default function AdminSetupSimple() {
  const { user, isLoaded } = useUser();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [debug, setDebug] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      setEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, user]);

  const handleDebug = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/debug-admin?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setDebug(data);
    } catch (error) {
      console.error("Debug error:", error);
      setDebug({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/debug-admin?email=${encodeURIComponent(email)}&force=true`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("Admin oluşturuldu! Admin paneline yönlendiriliyorsunuz...");
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      }
      
      setDebug(data);
    } catch (error) {
      console.error("Create admin error:", error);
      setError(String(error));
      setDebug({ error: String(error) });
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">LinkedIn Clone Basit Admin Kurulumu</h1>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6">
            {success}
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Bu sayfa admin hesabı oluşturmak için basitleştirilmiş bir arayüz sunar.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <div className="mb-4">
                <p className="font-medium">Kullanıcı Bilgileri:</p>
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
                <p><strong>Ad Soyad:</strong> {user?.fullName}</p>
              </div>
              
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleDebug}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Kontrol Ediliyor..." : "Admin Durumunu Kontrol Et"}
                </button>
                
                <button
                  onClick={handleCreateAdmin}
                  className="px-4 py-2 bg-[#0B63C4] text-white rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Oluşturuluyor..." : "Admin Olarak Ayarla"}
                </button>
              </div>
            </div>
            
            {debug && (
              <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Debug Bilgileri:</h3>
                <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(debug, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}