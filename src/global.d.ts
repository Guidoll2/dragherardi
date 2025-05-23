import { Mongoose } from "mongoose";

declare global {
  interface GlobalThis {
    mongoose?: {
      conn: Mongoose | null;
      promise: Promise<Mongoose> | null;
    };
  }
}

export {};