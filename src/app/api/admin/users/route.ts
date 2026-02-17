import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import connectToDatabase from "@/mongoDB/db";
import User from "@/mongoDB/models/users";

// GET: List pending users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await connectToDatabase();

    const pendingUsers = await User.find({ role: "pending" })
      .sort({ createdAt: -1 })
      .select("name email image createdAt")
      .lean();

    return NextResponse.json({ users: pendingUsers });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH: Approve or reject a user (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (!userId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await connectToDatabase();

    if (action === "approve") {
      await User.findByIdAndUpdate(userId, { role: "user", approved: true });
    } else {
      await User.findByIdAndDelete(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
