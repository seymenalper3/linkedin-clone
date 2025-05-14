// profile.ts
import mongoose, { Schema, Document, models, Model } from "mongoose";

// Define education entry
export interface IEducation {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  description?: string;
  isCurrentlyStudying?: boolean;
}

// Define experience entry
export interface IExperience {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  isCurrentPosition?: boolean;
}

// Define skills
export interface ISkill {
  name: string;
  endorsements?: number;
}

// Define basic profile
export interface IProfileBase {
  userId: string;
  headline?: string;
  about?: string;
  location?: string;
  website?: string;
  education?: IEducation[];
  experience?: IExperience[];
  skills?: ISkill[];
  phoneNumber?: string;
  birthday?: Date;
}

// Document interface
export interface IProfile extends IProfileBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Define methods for profile document
interface IProfileMethods {
  addEducation(education: IEducation): Promise<void>;
  removeEducation(educationId: string): Promise<void>;
  addExperience(experience: IExperience): Promise<void>;
  removeExperience(experienceId: string): Promise<void>;
  addSkill(skill: ISkill): Promise<void>;
  removeSkill(skillId: string): Promise<void>;
}

// Define static methods
interface IProfileStatics {
  getUserProfile(userId: string): Promise<IProfileDocument | null>;
}

// Combine document and statics with methods
export interface IProfileDocument extends IProfile, IProfileMethods {}
interface IProfileModel extends Model<IProfileDocument>, IProfileStatics {}

// Define schemas for nested objects
const EducationSchema = new Schema({
  school: { type: String, required: true },
  degree: { type: String },
  fieldOfStudy: { type: String },
  startYear: { type: Number, required: true },
  endYear: { type: Number },
  description: { type: String },
  isCurrentlyStudying: { type: Boolean, default: false }
});

const ExperienceSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
  isCurrentPosition: { type: Boolean, default: false }
});

const SkillSchema = new Schema({
  name: { type: String, required: true },
  endorsements: { type: Number, default: 0 }
});

// Main profile schema
const ProfileSchema = new Schema<IProfileDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    headline: { type: String },
    about: { type: String },
    location: { type: String },
    website: { type: String },
    education: [EducationSchema],
    experience: [ExperienceSchema],
    skills: [SkillSchema],
    phoneNumber: { type: String },
    birthday: { type: Date }
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
ProfileSchema.index({ userId: 1 });

// Instance methods for Profile document
ProfileSchema.methods.addEducation = async function(education: IEducation) {
  this.education.push(education);
  await this.save();
};

ProfileSchema.methods.removeEducation = async function(educationId: string) {
  this.education = this.education.filter(
    (edu: any) => edu._id.toString() !== educationId
  );
  await this.save();
};

ProfileSchema.methods.addExperience = async function(experience: IExperience) {
  this.experience.push(experience);
  await this.save();
};

ProfileSchema.methods.removeExperience = async function(experienceId: string) {
  this.experience = this.experience.filter(
    (exp: any) => exp._id.toString() !== experienceId
  );
  await this.save();
};

ProfileSchema.methods.addSkill = async function(skill: ISkill) {
  this.skills.push(skill);
  await this.save();
};

ProfileSchema.methods.removeSkill = async function(skillId: string) {
  this.skills = this.skills.filter(
    (skill: any) => skill._id.toString() !== skillId
  );
  await this.save();
};

// Static methods
ProfileSchema.statics.getUserProfile = async function(userId: string) {
  try {
    return await this.findOne({ userId });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const Profile =
  (models.Profile as IProfileModel) ||
  mongoose.model<IProfileDocument, IProfileModel>("Profile", ProfileSchema);