"use server";

import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/mongodb/db";
import mongoose from "mongoose";
import { Application } from "@/mongodb/models/application";
import { Post } from "@/mongodb/models/post";
import { revalidatePath } from "next/cache";
import { notifyUser } from "@/lib/notificationService";

export default async function applyJobAction(postId: string, coverLetter?: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authorized");
    }

    // Connect to DB
    await connectDB();

    // Find the post and verify it's a job post
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Job post not found");
    }

    if (post.type !== 'job') {
      throw new Error("This is not a job post");
    }

    // Check if the user is an employer (can't apply to own job or if user is employer)
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      userId: String,
      role: String,
    }));

    const dbUser = await User.findOne({ userId: user.id });
    const userRole = dbUser?.role || 'employee';

    if (userRole !== 'employee') {
      throw new Error("Only employees can apply for jobs");
    }

    // Check if user is trying to apply to their own post
    if (post.user.userId === user.id) {
      throw new Error("You cannot apply to your own job post");
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      postId: post._id,
      'applicant.userId': user.id
    });

    if (existingApplication) {
      throw new Error("You have already applied to this job");
    }

    // Create application
    const application = await Application.create({
      postId: post._id,
      employer: post.user,
      applicant: {
        userId: user.id,
        userImage: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'employee'
      },
      coverLetter,
      status: 'pending'
    });

    // Notify the employer about the application
    await notifyUser({
      fromUserId: user.id,
      toUserId: post.user.userId,
      type: 'job_application',
      message: `${user.firstName} ${user.lastName} applied to your job post`,
      reference: {
        postId: post._id,
        applicationId: application._id
      }
    });

    // Revalidate path to update the UI
    revalidatePath('/');

    return { success: true, message: "Successfully applied to job" };
  } catch (error: any) {
    console.error("Error applying to job:", error);
    return { 
      success: false, 
      message: error.message || "Failed to apply to job" 
    };
  }
}