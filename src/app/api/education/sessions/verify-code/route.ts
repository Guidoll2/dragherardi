import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/mongoDB/db";
import LiveSessionModel from "@/mongoDB/models/liveSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, accessCode } = body;

    if (!sessionId || !accessCode) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    await connectToDatabase();

    const session = await LiveSessionModel.findById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    if (!session.isPrivate) {
      return NextResponse.json({ valid: true, message: "Sesión pública" });
    }

    const isValid = session.accessCode === accessCode.toUpperCase();

    if (isValid) {
      return NextResponse.json({ valid: true, message: "Código correcto" });
    } else {
      return NextResponse.json({ valid: false, message: "Código incorrecto" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error verifying access code:", error);
    return NextResponse.json({ error: "Error al verificar código" }, { status: 500 });
  }
}
