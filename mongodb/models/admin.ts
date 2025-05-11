import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IAdminBase {
  userId: string;  // Clerk user ID
  email: string;
  createdAt: Date;
}

export interface IAdmin extends IAdminBase, Document {}

// Define methods interface
interface IAdminMethods {
  removeAdmin(): Promise<void>;
}

// Define statics interface
interface IAdminStatics {
  getAllAdmins(): Promise<IAdminDocument[]>;
  isUserAdmin(userId: string): Promise<boolean>;
}

// Merge document type with methods
export interface IAdminDocument extends IAdmin, IAdminMethods {}

// Create model interface
interface IAdminModel extends Model<IAdminDocument>, IAdminStatics {}

const AdminSchema = new Schema<IAdminDocument>({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Methods
AdminSchema.methods.removeAdmin = async function() {
  try {
    await this.model("Admin").deleteOne({ _id: this._id });
  } catch (error) {
    console.error("Error removing admin:", error);
    throw error;
  }
};

// Statics
AdminSchema.statics.getAllAdmins = async function() {
  try {
    const admins = await this.find().sort({ createdAt: -1 });
    return admins;
  } catch (error) {
    console.error("Error getting all admins:", error);
    return [];
  }
};

AdminSchema.statics.isUserAdmin = async function(userId: string) {
  try {
    const admin = await this.findOne({ userId });
    return !!admin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const Admin = (models.Admin as IAdminModel) || 
  mongoose.model<IAdminDocument, IAdminModel>("Admin", AdminSchema);