import mongoose, { Schema, Model } from "mongoose";
import { ChatMessage } from "@/types/education";

const ChatMessageSchema = new Schema<ChatMessage>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isInstructor: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: String,
    },
  },
  {
    timestamps: false,
  }
);

const ChatMessageModel: Model<ChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<ChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessageModel;
