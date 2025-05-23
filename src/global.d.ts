import { Mongoose } from "mongoose";

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
      };
    }
  }

  // Alternativa moderna: extender globalThis directamente
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

export {};