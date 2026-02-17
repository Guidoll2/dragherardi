import { NextResponse } from "next/server";
import { getCurrentUserInfo } from "@/lib/utils/auth";

export async function GET() {
  try {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      role: userInfo.role,
      name: userInfo.name,
      email: userInfo.email,
    });
  } catch (error) {
    console.error("Error getting user role:", error);
    return NextResponse.json(
      { error: "Error al obtener el rol del usuario" },
      { status: 500 }
    );
  }
}
