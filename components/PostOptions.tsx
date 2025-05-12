"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Repeat2, Send, ThumbsUpIcon } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentFeed from "./CommentFeed";
import { useUser } from "@clerk/nextjs";
import { LikePostRequestBody } from "@/app/api/posts/[post_id]/like/route";
import { IPostDocument } from "@/mongodb/models/post";
import { cn } from "@/lib/utils";
import { UnlikePostRequestBody } from "@/app/api/posts/[post_id]/unlike/route";
import { Button } from "./ui/button";
import { toast } from "sonner";

function PostOptions({
  postId,
  post,
}: {
  postId: string;
  post: IPostDocument;
}) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  useEffect(() => {
    if (user?.id && post.likes?.includes(user.id)) {
      setLiked(true);
    }
  }, [post, user]);

  const likeOrUnlikePost = async () => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const originalLiked = liked;
    const originalLikes = likes;

    const newLikes = liked
      ? likes?.filter((like) => like !== user.id)
      : [...(likes ?? []), user.id];

    const body: LikePostRequestBody | UnlikePostRequestBody = {
      userId: user.id,
    };

    setLiked(!liked);
    setLikes(newLikes);

    const response = await fetch(
      `/api/posts/${postId}/${liked ? "unlike" : "like"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body }),
      }
    );

    if (!response.ok) {
      setLiked(originalLiked);
      throw new Error("Failed to like post");
    }

    const fetchLikesResponse = await fetch(`/api/posts/${postId}/like`);
    if (!fetchLikesResponse.ok) {
      setLikes(originalLikes);
      throw new Error("Failed to fetch likes");
    }

    const newLikesData = await fetchLikesResponse.json();

    setLikes(newLikesData);
  };

  return (
    <div className="">
      <div className="flex justify-between px-4 py-2 items-center">
        <div>
          {likes && likes.length > 0 && (
            <div className="flex items-center">
              <span className="bg-primary rounded-full p-1 flex items-center justify-center mr-1">
                <ThumbsUpIcon className="h-3 w-3 text-white" />
              </span>
              <p className="text-xs text-muted-foreground cursor-pointer hover:underline">
                {likes.length} {likes.length === 1 ? 'like' : 'likes'}
              </p>
            </div>
          )}
        </div>

        <div>
          {post?.comments && post.comments.length > 0 && (
            <p
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
            >
              {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between border-t border-border">
        <Button
          variant="ghost"
          className="postButton"
          onClick={likeOrUnlikePost}
        >
          {/* If user has liked the post, show filled thumbs up icon */}
          <ThumbsUpIcon
            className={cn("h-4 w-4", liked ? "text-primary fill-primary" : "")}
          />
          <span className={liked ? "text-primary" : ""}>Like</span>
        </Button>

        <Button
          variant="ghost"
          className="postButton"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
        >
          <MessageCircle
            className={cn(
              "h-4 w-4",
              isCommentsOpen ? "text-primary fill-primary/20" : ""
            )}
          />
          <span className={isCommentsOpen ? "text-primary" : ""}>Comment</span>
        </Button>

        <Button variant="ghost" className="postButton">
          <Repeat2 className="h-4 w-4" />
          Share
        </Button>

        <Button variant="ghost" className="postButton">
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>

      {isCommentsOpen && (
        <div className="p-4">
          {user?.id && <CommentForm postId={postId} />}
          <CommentFeed post={post} />
        </div>
      )}
    </div>
  );
}

export default PostOptions;
