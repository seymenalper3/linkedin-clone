"use client";

import createPostAction from "@/actions/createPostAction";
import { useUser } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ImageIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

function PostForm() {
  const ref = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { user, isSignedIn, isLoaded } = useUser();

  const handlePostAction = async (formData: FormData): Promise<void> => {
    const formDataCopy = formData;
    ref.current?.reset();

    const text = formDataCopy.get("postInput") as string;

    if (!text) {
      throw new Error("You must provide a post input");
    }

    setPreview(null);

    try {
      await createPostAction(formDataCopy);
    } catch (error) {
      console.error(`Error creating post: ${error}`);

      // Display toast
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="mb-2">
      <form
        ref={ref}
        action={(formData) => {
          const promise = handlePostAction(formData);
          toast.promise(promise, {
            loading: "Creating post...",
            success: "Post created!",
            error: (e) => "Error creating post: " + e.message,
          });
        }}
        className="p-5 card"
      >
        <div className="flex items-center space-x-3">
          <Avatar className="avatar-linkedin h-10 w-10">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <input
            type="text"
            name="postInput"
            placeholder="Start writing a post..."
            className="flex-1 outline-none rounded-full py-2.5 px-4 border border-border bg-accent/50 placeholder:text-muted-foreground/70 text-sm"
          />

          {/* add input file selector for images only */}
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />

          <button type="submit" hidden>
            Post
          </button>
        </div>

        {preview && (
          <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border border-border">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant={preview ? "secondary" : "outline"}
            className={preview ? "bg-accent text-accent-foreground" : ""}
            size="sm"
          >
            <ImageIcon className="mr-2" size={16} />
            {preview ? "Change" : "Add"} image
          </Button>

          {/* add a remove button */}
          {preview && (
            <Button
              type="button"
              onClick={() => setPreview(null)}
              variant="outline"
              size="sm"
              className="ml-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <XIcon className="mr-2" size={16} />
              Remove image
            </Button>
          )}
        </div>
      </form>

      <div className="my-4"></div>
    </div>
  );
}

export default PostForm;
