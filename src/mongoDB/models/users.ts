// src/mongodb/models/user.ts
import mongoose, { Document, Model } from "mongoose";

interface IUser extends Document {
  clerkUserId?: string; // Opcional para compatibilidad con datos antiguos
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  imageUrl?: string;
  professionalId?: string;
  role?: "admin" | "user" | "pending";
  approved?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    clerkUserId: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    name: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    image: { type: String },
    imageUrl: { type: String },
    professionalId: { type: String },
    role: { type: String, enum: ["admin", "user", "pending"], default: "pending" },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
