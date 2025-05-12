"use client";

import { IPostDocument, PostType } from "@/mongodb/models/post";
import Post from "./Post";
import { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

function PostFeed({ posts }: { posts: IPostDocument[] }) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredPosts = posts?.filter((post) => {
    if (activeTab === "all") return true;
    if (activeTab === "jobs") return post.type === "job";
    // Consider 'normal' or undefined/missing type as regular posts
    if (activeTab === "posts") return post.type !== "job";
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="posts">Regular Posts</TabsTrigger>
          <TabsTrigger value="jobs">Job Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 mt-2">
          {posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="posts" className="space-y-2 mt-2">
          {filteredPosts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-2 mt-2">
          {filteredPosts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PostFeed;
