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
import ApplyJobButton from "./ApplyJobButton";
import Link from "next/link";

function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser();

  const isAuthor = user?.id === post.user.userId;
  // Safe check for post type with fallback to 'normal'
  const isJobPost = post.type === 'job';

  return (
    <div className={`post-card ${isJobPost ? 'border-secondary border-2' : ''}`}>
      {isJobPost && (
        <div className="bg-secondary text-white text-center py-1.5 font-medium rounded-t-lg -mt-4 -mx-4 mb-3">
          Job Opportunity
        </div>
      )}
      <div className="flex space-x-3">
        <div>
          <Link href={`/profile/${post.user.userId}`}>
            <Avatar className="avatar-linkedin h-12 w-12 cursor-pointer hover:opacity-90 transition-opacity">
              <AvatarImage src={post.user.userImage} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {post.user.firstName?.charAt(0)}
                {post.user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <div className="flex justify-between flex-1">
          <div>
            <p className="font-semibold text-card-foreground/90">
              <Link href={`/profile/${post.user.userId}`} className="hover:underline">
                {post.user.firstName} {post.user.lastName}
              </Link>{" "}
              {isAuthor && (
                <Badge className="ml-1 bg-accent text-accent-foreground font-medium">
                  Author
                </Badge>
              )}
              {post.user.role && post.user.role === 'employer' && (
                <Badge className="ml-1 bg-secondary/10 text-secondary border-secondary/20 font-medium">
                  Employer
                </Badge>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              @{post.user.firstName}
              {post.user.firstName}-{post.user.userId.toString().slice(-4)}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>
          </div>

          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                const promise = deletePostAction(post._id);
                toast.promise(promise, {
                  loading: "Deleting post...",
                  success: "Post deleted!",
                  error: "Error deleting post",
                });
              }}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className={`mt-3 ${isJobPost ? 'bg-accent rounded-md p-4' : ''}`}>
        {isJobPost ? (
          <div>
            <h3 className="font-bold text-lg text-primary mb-3">Job Description</h3>
            <div className="job-description whitespace-pre-line text-card-foreground/80 text-sm leading-relaxed">{post.text}</div>

            <div className="mt-5 flex justify-end">
              {user && user.id !== post.user.userId && (
                <ApplyJobButton postId={post._id} employer={post.user} />
              )}
            </div>
          </div>
        ) : (
          <p className="text-card-foreground/90 mt-1 leading-relaxed">{post.text}</p>
        )}

        {/* If image uploaded put it here... */}
        {post.imageUrl && (
          <div className="mt-4 rounded-md overflow-hidden">
            <Image
              src={post.imageUrl}
              alt="Post Image"
              width={500}
              height={500}
              className="w-full mx-auto object-cover"
            />
          </div>
        )}
      </div>

      <PostOptions postId={post._id} post={post} />
    </div>
  );
}

export default Post;
