import mongoose, { Schema, Model } from "mongoose";
import { Classroom } from "@/types/education";

const ClassroomSchema = new Schema<Classroom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructorId: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    students: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    coverImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ClassroomModel: Model<Classroom> =
  mongoose.models.Classroom || mongoose.model<Classroom>("Classroom", ClassroomSchema);

export default ClassroomModel;
