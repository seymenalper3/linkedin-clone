"use server";

import { AddPostRequestBody } from "@/app/api/posts/route";
import generateSASToken, { containerName } from "@/lib/generateSASToken";

import { Post, PostType } from "@/mongodb/models/post";
import { IUser, UserRole } from "@/types/user";
import { BlobServiceClient } from "@azure/storage-blob";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/mongodb/db";

export default async function createPostAction(formData: FormData) {
  const user = await currentUser();
  const postInput = formData.get("postInput") as string;
  const image = formData.get("image") as File;
  let image_url = undefined;

  if (!postInput) {
    throw new Error("Post input is required");
  }

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Connect to database
  await connectDB();

  // Fetch the user role if it exists
  // Construct a UserSchema that matches whatever you have in your database
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    userId: String,
    role: String,
  }));

  // Safely fetch user role with fallback to 'employee'
  const dbUser = await User.findOne({ userId: user.id });
  const role = (dbUser?.role || 'employee') as UserRole; // Default to employee if not set

  const userDB: IUser = {
    userId: user.id,
    userImage: user.imageUrl,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    role: role as any,
  };

  try {
    if (image.size > 0) {
      console.log("Uploading image to Azure Blob Storage...", image);

      const accountName = process.env.AZURE_STORAGE_NAME;

      const sasToken = await generateSASToken();

      const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net?${sasToken}`
      );

      const containerClient =
        blobServiceClient.getContainerClient(containerName);

      // generate current timestamp
      const timestamp = new Date().getTime();
      const file_name = `${randomUUID()}_${timestamp}.png`;

      const blockBlobClient = containerClient.getBlockBlobClient(file_name);

      const imageBuffer = await image.arrayBuffer();
      const res = await blockBlobClient.uploadData(imageBuffer);
      image_url = res._response.request.url;

      console.log("File uploaded successfully!", image_url);

      // Set post type based on user role
      const postType: PostType = role === 'employer' ? 'job' : 'normal';

      const body: AddPostRequestBody = {
        user: userDB,
        text: postInput,
        imageUrl: image_url,
        type: postType
      };

      await Post.create(body);
    } else {
      // Set post type based on user role
      const postType: PostType = role === 'employer' ? 'job' : 'normal';

      const body: AddPostRequestBody = {
        user: userDB,
        text: postInput,
        type: postType
      };

      await Post.create(body);
    }
  } catch (error: any) {
    throw new Error("Failed to create post", error);
  }

  revalidatePath("/");
}
