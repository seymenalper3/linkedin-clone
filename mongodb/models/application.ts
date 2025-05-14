// application.ts
import mongoose, { Schema, Document, models, Model } from "mongoose";
import { IUser } from "@/types/user";

export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export interface IApplicationBase {
  postId: string;
  employer: IUser;
  applicant: IUser;
  coverLetter?: string;
  status: ApplicationStatus;
}

export interface IApplication extends IApplicationBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Define document methods (for each instance of an application)
interface IApplicationMethods {
  updateStatus(status: ApplicationStatus): Promise<void>;
}

// Define static methods
interface IApplicationStatics {
  getApplicationsForPost(postId: string): Promise<IApplicationDocument[]>;
  getApplicationsForUser(userId: string): Promise<IApplicationDocument[]>;
  getApplicationsForEmployer(employerId: string): Promise<IApplicationDocument[]>;
  hasUserApplied(postId: string, userId: string): Promise<boolean>;
}

// Merge the document methods, and static methods with IApplication
export interface IApplicationDocument extends IApplication, IApplicationMethods {}
interface IApplicationModel extends IApplicationStatics, Model<IApplicationDocument> {}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    postId: { type: String, required: true },
    employer: {
      userId: { type: String, required: true },
      userImage: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String },
      role: { type: String, enum: ['employer'] },
    },
    applicant: {
      userId: { type: String, required: true },
      userImage: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String },
      role: { type: String, enum: ['employee'] },
    },
    coverLetter: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'reviewing', 'accepted', 'rejected'],
      default: 'pending' 
    },
  },
  {
    timestamps: true,
  }
);

// Index to improve query performance
ApplicationSchema.index({ postId: 1 });
ApplicationSchema.index({ 'applicant.userId': 1 });
ApplicationSchema.index({ 'employer.userId': 1 });

// Check if user already applied to this post
ApplicationSchema.index(
  { postId: 1, 'applicant.userId': 1 }, 
  { unique: true }
);

// Instance method to update application status
ApplicationSchema.methods.updateStatus = async function(status: ApplicationStatus) {
  try {
    this.status = status;
    await this.save();
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

// Static method to get applications for a specific post
ApplicationSchema.statics.getApplicationsForPost = async function(postId: string) {
  try {
    const applications = await this.find({ postId })
      .sort({ createdAt: -1 })
      .lean();
    
    return applications.map((app: IApplicationDocument) => ({
      ...app,
      _id: app._id.toString(),
    }));
  } catch (error) {
    console.error("Error getting applications for post:", error);
    throw error;
  }
};

// Static method to get applications from a specific user
ApplicationSchema.statics.getApplicationsForUser = async function(userId: string) {
  try {
    const applications = await this.find({ 'applicant.userId': userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return applications.map((app: IApplicationDocument) => ({
      ...app,
      _id: app._id.toString(),
    }));
  } catch (error) {
    console.error("Error getting applications for user:", error);
    throw error;
  }
};

// Static method to get applications for jobs posted by an employer
ApplicationSchema.statics.getApplicationsForEmployer = async function(employerId: string) {
  try {
    const applications = await this.find({ 'employer.userId': employerId })
      .sort({ createdAt: -1 })
      .lean();
    
    return applications.map((app: IApplicationDocument) => ({
      ...app,
      _id: app._id.toString(),
    }));
  } catch (error) {
    console.error("Error getting applications for employer:", error);
    throw error;
  }
};

// Check if a user has already applied to a post
ApplicationSchema.statics.hasUserApplied = async function(postId: string, userId: string) {
  try {
    const application = await this.findOne({ 
      postId, 
      'applicant.userId': userId 
    });
    return !!application;
  } catch (error) {
    console.error("Error checking if user applied:", error);
    return false;
  }
};

export const Application =
  (models.Application as IApplicationModel) ||
  mongoose.model<IApplicationDocument, IApplicationModel>("Application", ApplicationSchema);