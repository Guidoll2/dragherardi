import mongoose, { Schema, Model } from "mongoose";
import { EducationalMaterial } from "@/types/education";

const EducationalMaterialSchema = new Schema<EducationalMaterial>(
  {
    classroomId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "pdf", "word", "excel", "powerpoint", "google-drive", "link"],
      required: true,
    },
    content: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    externalLink: {
      type: String,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    uploadedByName: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const EducationalMaterialModel: Model<EducationalMaterial> =
  mongoose.models.EducationalMaterial ||
  mongoose.model<EducationalMaterial>("EducationalMaterial", EducationalMaterialSchema);

export default EducationalMaterialModel;
