// src/mongodb/models/user.ts
import mongoose, { Document, Model } from "mongoose";

interface IUser extends Document {
  clerkUserId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  professionalId: { type: String };
  role?: "admin" | "user";
}

const userSchema = new mongoose.Schema<IUser>({
  clerkUserId: { type: String, required: true, unique: true },
  email: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  imageUrl: { type: String },
  professionalId: { type: String },
  role: { type: String, enum: ["admin", "user"], default: "user" },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
