// app/api/publications/tags/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/mongoDB/db";
import Publication from "@/mongoDB/models/publication";

// GET - Obtener todas las etiquetas únicas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.approved) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Obtener todas las etiquetas únicas de publicaciones publicadas
    const tags = await Publication.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
    ]);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error al obtener etiquetas:", error);
    return NextResponse.json(
      { error: "Error al obtener etiquetas" },
      { status: 500 }
    );
  }
}
