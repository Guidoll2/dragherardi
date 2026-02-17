// app/api/publications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/mongoDB/db";
import Publication from "@/mongoDB/models/publication";

// GET - Obtener una publicación por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    await dbConnect();

    const publication = await Publication.findById(id).lean();

    if (!publication) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // Si es pública, incrementar contador de lecturas
    if (publication.isPubliclyVisible && publication.status === "published") {
      await Publication.findByIdAndUpdate(id, { $inc: { readCount: 1 } });
      return NextResponse.json(publication);
    }

    // Para publicaciones no públicas, verificar autenticación
    if (!session || !session.user?.approved) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar permisos para borradores
    if (publication.status === "draft") {
      const isAuthor = publication.authorId === session.user.id;
      const isCoAuthor = publication.coAuthors?.some(
        (ca: { id: string }) => ca.id === session.user?.id
      );
      const isAdmin = session.user.role === "admin";

      if (!isAuthor && !isCoAuthor && !isAdmin) {
        return NextResponse.json(
          { error: "No tienes permisos para ver este borrador" },
          { status: 403 }
        );
      }
    }

    // Incrementar contador de lecturas
    await Publication.findByIdAndUpdate(id, { $inc: { readCount: 1 } });

    return NextResponse.json(publication);
  } catch (error) {
    console.error("Error al obtener publicación:", error);
    return NextResponse.json(
      { error: "Error al obtener publicación" },
      { status: 500 }
    );
  }
}
