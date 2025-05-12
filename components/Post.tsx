"use client";

import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { IPostDocument } from "@/mongodb/models/post";
import PostOptions from "./PostOptions";
import Image from "next/image";
import deletePostAction from "@/actions/deletePostAction";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import ReactTimeago from "react-timeago";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser();

  const isAuthor = user?.id === post.user.userId;
  // Safe check for post type with fallback to 'normal'
  const isJobPost = post.type === 'job';

  return (
    <div className={`bg-white rounded-md border ${isJobPost ? 'border-blue-300 border-2' : ''}`}>
      {isJobPost && (
        <div className="bg-blue-500 text-white text-center py-1 font-medium">
          Job Opportunity
        </div>
      )}
      <div className="p-4 flex space-x-2">
        <div>
          <Avatar>
            <AvatarImage src={post.user.userImage} />
            <AvatarFallback>
              {post.user.firstName?.charAt(0)}
              {post.user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-between flex-1">
          <div>
            <p className="font-semibold">
              {post.user.firstName} {post.user.lastName}{" "}
              {isAuthor && (
                <Badge className="ml-2" variant="secondary">
                  Author
                </Badge>
              )}
              {post.user.role && post.user.role === 'employer' && (
                <Badge className="ml-2" variant="outline">
                  Employer
                </Badge>
              )}
            </p>
            <p className="text-xs text-gray-400">
              @{post.user.firstName}
              {post.user.firstName}-{post.user.userId.toString().slice(-4)}
            </p>

            <p className="text-xs text-gray-400">
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>
          </div>

          {isAuthor && (
            <Button
              variant="outline"
              onClick={() => {
                const promise = deletePostAction(post._id);
                toast.promise(promise, {
                  loading: "Deleting post...",
                  success: "Post deleted!",
                  error: "Error deleting post",
                });
              }}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <div className={`${isJobPost ? 'bg-blue-50' : ''}`}>
        {isJobPost ? (
          <div className="px-4 pb-2 mt-2">
            <h3 className="font-bold text-lg text-blue-800 mb-2">Job Description</h3>
            <div className="job-description whitespace-pre-line">{post.text}</div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">
                Apply Now
              </Button>
            </div>
          </div>
        ) : (
          <p className="px-4 pb-2 mt-2">{post.text}</p>
        )}

        {/* If image uploaded put it here... */}
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt="Post Image"
            width={500}
            height={500}
            className="w-full mx-auto"
          />
        )}
      </div>

      <PostOptions postId={post._id} post={post} />
    </div>
  );
}

export default Post;
