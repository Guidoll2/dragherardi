import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserInfo } from "@/lib/utils/auth";
import connectToDatabase from "@/mongoDB/db";
import ChatMessageModel from "@/mongoDB/models/chatMessage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
    }

    await connectToDatabase();

    const messages = await ChatMessageModel.find({ sessionId })
      .sort({ timestamp: 1 })
      .limit(200); // Últimos 200 mensajes

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    return NextResponse.json({ error: "Error al obtener mensajes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, message, replyTo } = body;

    if (!sessionId || !message) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    await connectToDatabase();

    const chatMessage = await ChatMessageModel.create({
      sessionId,
      userId: userInfo.id,
      userName: userInfo.name,
      message,
      timestamp: new Date(),
      isInstructor: userInfo.role === "admin",
      replyTo: replyTo || "",
    });

    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat message:", error);
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
