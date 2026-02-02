import mongoose, { Schema, Model } from "mongoose";
import { LiveSession } from "@/types/education";

const LiveSessionSchema = new Schema<LiveSession>(
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
    scheduledFor: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
    },
    streamUrl: {
      type: String,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    recordingUrl: {
      type: String,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    accessCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const LiveSessionModel: Model<LiveSession> =
  mongoose.models.LiveSession ||
  mongoose.model<LiveSession>("LiveSession", LiveSessionSchema);

export default LiveSessionModel;
