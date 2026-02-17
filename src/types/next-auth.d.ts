import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      approved: boolean;
      role: "admin" | "user" | "pending";
    } & DefaultSession["user"];
  }

  interface User {
    approved?: boolean;
    role?: "admin" | "user" | "pending";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    approved: boolean;
    role: "admin" | "user" | "pending";
  }
}
