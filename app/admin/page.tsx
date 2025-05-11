import React from 'react';
import { Admin } from '@/mongodb/models/admin';
import { Post } from '@/mongodb/models/post';
import { Followers } from '@/mongodb/models/followers';
import connectDB from '@/mongodb/db';
import { clerkClient } from "@clerk/nextjs/server";

// Kullanıcı sayısını gösteren kart bileşeni
const StatCard = ({ title, value, description }: { title: string; value: number | string; description: string }) => (
  <div className="bg-white rounded-lg border p-6 shadow-sm">
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    <p className="text-sm text-gray-500 mt-2">{description}</p>
  </div>
);

export default async function AdminDashboard() {
  await connectDB();

  // Toplam kullanıcı sayısını al
  let totalUsers = 0;
  try {
    const usersResponse = await clerkClient.users.getUserList();
    totalUsers = usersResponse.data.length;
  } catch (error) {
    console.error("Error fetching users:", error);
  }

  // Toplam post sayısını al
  let totalPosts = 0;
  try {
    const posts = await Post.find();
    totalPosts = posts.length;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  // Toplam takip ilişkisi sayısını al
  let totalFollows = 0;
  try {
    const follows = await Followers.find();
    totalFollows = follows.length;
  } catch (error) {
    console.error("Error fetching follows:", error);
  }

  // Admin sayısını al
  let totalAdmins = 0;
  try {
    const admins = await Admin.find();
    totalAdmins = admins.length;
  } catch (error) {
    console.error("Error fetching admins:", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Toplam Kullanıcı" 
          value={totalUsers} 
          description="Sistemdeki kayıtlı kullanıcı sayısı" 
        />
        <StatCard 
          title="Toplam Post" 
          value={totalPosts} 
          description="Oluşturulan toplam gönderi sayısı" 
        />
        <StatCard 
          title="Toplam Takip" 
          value={totalFollows} 
          description="Kullanıcılar arası takip ilişkisi sayısı" 
        />
        <StatCard 
          title="Admin Sayısı" 
          value={totalAdmins} 
          description="Sistemdeki yetkili admin sayısı" 
        />
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Admin Paneli Hakkında</h2>
        <p className="text-gray-700 mb-4">
          Bu admin paneli ile kullanıcıları, postları ve sistem ayarlarını yönetebilirsiniz.
          Sol menüden erişmek istediğiniz yönetim arayüzünü seçebilirsiniz.
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>Kullanıcı Yönetimi:</strong> Kullanıcıları görüntüleyebilir ve yönetebilirsiniz.</li>
          <li><strong>Post Yönetimi:</strong> Tüm gönderileri görüntüleyebilir ve moderasyon işlemleri yapabilirsiniz.</li>
          <li><strong>Admin Yönetimi:</strong> Sistem yöneticilerini ekleyebilir veya kaldırabilirsiniz.</li>
        </ul>
      </div>
    </div>
  );
}