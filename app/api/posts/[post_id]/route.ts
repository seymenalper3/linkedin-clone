import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { NextResponse } from "next/server";

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  await connectDB();

  try {
    const post = await Post.findById(params.post_id)
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
      });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" }, 
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ post }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching the post" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export interface DeletePostRequestBody {
  userId: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  //   auth().protect();

  await connectDB();
  const { userId }: DeletePostRequestBody = await request.json();

  try {
    const post = await Post.findById(params.post_id);

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" }, 
        { status: 404, headers: corsHeaders }
      );
    }

    if (post.user.userId !== userId) {
      return NextResponse.json(
        { error: "Post does not belong to the user" },
        { status: 403, headers: corsHeaders }
      );
    }

    await post.removePost();

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while deleting the post" },
      { status: 500, headers: corsHeaders }
    );
  }
}
