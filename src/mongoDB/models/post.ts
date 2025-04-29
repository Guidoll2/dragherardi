// models/Post.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  content: string;
  createdAt: Date;
  userId: string;
  firstName: string;
  lastName: string;
}

const PostSchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.models.Post ||
  mongoose.model<IPost>("Post", PostSchema);
