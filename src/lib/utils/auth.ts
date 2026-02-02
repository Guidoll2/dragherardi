import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@/types/education";

const ADMIN_EMAILS = ["candegherardi@gmail.com", "guido.llaurado@gmail.com"];

export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  
  if (ADMIN_EMAILS.includes(userEmail || "")) {
    return "admin";
  }
  
  return "student";
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

export async function getCurrentUserInfo() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  const role = ADMIN_EMAILS.includes(userEmail || "") ? "admin" : "student";

  return {
    id: user.id,
    email: userEmail,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Usuario",
    role,
  };
}
