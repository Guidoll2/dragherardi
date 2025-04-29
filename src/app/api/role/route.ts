import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongoDB/db"; // Conexión a la base de datos con mongoose
import User from "@/mongoDB/models/users"; // Modelo de usuario de mongoose

export async function GET(req: NextRequest) {
  try {
    // Obtener el clerkUserId desde los parámetros de la solicitud
    const { searchParams } = new URL(req.url);
    const clerkUserId = searchParams.get("clerkUserId");

    console.log("clerkUserId recibido:", clerkUserId); // Log para depuración

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Se requiere clerkUserId válido" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar el usuario en la base de datos
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Enviar el rol del usuario
    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
