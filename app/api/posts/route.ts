import connectDB from "@/mongodb/db";
import { IPostBase, Post } from "@/mongodb/models/post";
import { IUser } from "@/types/user";
import { NextResponse } from "next/server";

export interface AddPostRequestBody {
  user: IUser;
  text: string;
  imageUrl?: string | null;
  type?: 'normal' | 'job';
}

export async function POST(request: Request) {
  //  auth().protect();
  const { user, text, imageUrl, type }: AddPostRequestBody = await request.json();

  try {
    await connectDB();

    // Validate the type if provided
    const validType = type === 'job' || type === 'normal' || !type;

    if (!validType) {
      return NextResponse.json(
        { error: "Invalid post type. Must be 'normal' or 'job'" },
        { status: 400 }
      );
    }

    const postData: IPostBase = {
      user,
      text,
      ...(imageUrl && { imageUrl }),
      ...(type && { type }),
    };

    const post = await Post.create(postData);
    return NextResponse.json({ message: "Post created successfully", post });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while creating the post ${error}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const posts = await Post.getAllPosts();

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching posts" },
      { status: 500 }
    );
  }
}
