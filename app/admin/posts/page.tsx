import React from 'react';
import { Post } from '@/mongodb/models/post';
import { clerkClient } from "@clerk/nextjs/server";
import connectDB from '@/mongodb/db';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function PostsManagement() {
  await connectDB();
  
  // Tüm postları getir
  let posts: any[] = [];
  try {
    posts = await Post.getAllPosts();
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Post Yönetimi</h1>
      
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Tüm Gönderiler</h2>
          <p className="text-sm text-gray-500">Sistemdeki tüm gönderiler ({posts.length})</p>
        </div>
        
        <div className="space-y-6 p-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.user.userImage} />
                      <AvatarFallback>
                        {post.user.firstName?.[0] || ''}{post.user.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {post.user.firstName} {post.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <form action={`/api/admin/posts/${post._id}/delete`} method="POST">
                      <Button type="submit" variant="outline" size="sm" className="text-red-600">
                        <Trash2 size={16} className="mr-1" />
                        Sil
                      </Button>
                    </form>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.text}</p>
                  
                  {post.imageUrl && (
                    <div className="mt-4 relative h-64 w-full">
                      <Image 
                        src={post.imageUrl} 
                        alt="Post image" 
                        layout="fill" 
                        objectFit="contain" 
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 px-4 py-2 border-t flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <MessageSquare size={16} className="mr-1" />
                      {post.comments?.length || 0} Yorum
                    </span>
                    <span>
                      {post.likes?.length || 0} Beğeni
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Henüz gönderi bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}