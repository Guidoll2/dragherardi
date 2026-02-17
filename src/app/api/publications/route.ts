// app/api/publications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/mongoDB/db";
import Publication, { PublicationStatus } from "@/mongoDB/models/publication";

// GET - Listar publicaciones con filtros
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.approved) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as PublicationStatus | null;
    const author = searchParams.get("author");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const myPublications = searchParams.get("my") === "true";

    // Construir query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // Usuarios normales solo ven publicaciones publicadas o sus propios borradores
    if (session.user.role !== "admin") {
      if (myPublications) {
        query.authorId = session.user.id;
      } else {
        query.$or = [
          { status: "published" },
          { authorId: session.user.id },
          { "coAuthors.id": session.user.id },
        ];
      }
    } else {
      // Admins pueden filtrar por estado
      if (status) {
        query.status = status;
      }
      if (myPublications) {
        query.authorId = session.user.id;
      }
    }

    if (author) {
      query.authorId = author;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [publications, total] = await Promise.all([
      Publication.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Publication.countDocuments(query),
    ]);

    return NextResponse.json({
      publications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener publicaciones" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva publicación
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.approved) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { title, summary, content, tags, status, coAuthors, paperType, sections, structuredAbstract, figures, references, meshKeywords } = body;

    if (!title || !summary) {
      return NextResponse.json(
        { error: "Título y resumen son obligatorios" },
        { status: 400 }
      );
    }

    // Build content from sections if not provided directly
    const derivedContent = content || (sections?.map((s: { title: string; content: string }) => `<h2>${s.title}</h2>\n${s.content}`).join("\n\n") || "");

    const publicationData = {
      title,
      summary,
      content: derivedContent,
      tags: tags || [],
      status: status || "draft",
      coAuthors: coAuthors || [],
      authorId: session.user.id,
      authorName: session.user.name || "Usuario",
      authorEmail: session.user.email || "",
      publishedAt: status === "published" ? new Date() : undefined,
      // New paper fields
      ...(paperType && { paperType }),
      ...(sections && { sections }),
      ...(structuredAbstract && { structuredAbstract }),
      ...(figures && { figures }),
      ...(references && { references }),
      ...(meshKeywords && { meshKeywords }),
    };

    const newPublication = await Publication.create(publicationData);

    return NextResponse.json(newPublication, { status: 201 });
  } catch (error) {
    console.error("Error al crear publicación:", error);
    return NextResponse.json(
      { error: "Error al crear publicación" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar publicación
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.approved) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { id, title, summary, content, tags, status, coAuthors, isPubliclyVisible, paperType, sections, structuredAbstract, figures, references, meshKeywords } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de publicación requerido" },
        { status: 400 }
      );
    }

    const publication = await Publication.findById(id);

    if (!publication) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar permisos: solo autor, coautores o admin pueden editar
    const isAuthor = publication.authorId === session.user.id;
    const isCoAuthor = publication.coAuthors.some(
      (ca: { id: string }) => ca.id === session.user?.id
    );
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isCoAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta publicación" },
        { status: 403 }
      );
    }

    // Actualizar campos básicos
    if (title !== undefined) publication.title = title;
    if (summary !== undefined) publication.summary = summary;
    if (content !== undefined) publication.content = content;
    if (tags !== undefined) publication.tags = tags;
    if (coAuthors !== undefined) publication.coAuthors = coAuthors;
    if (isPubliclyVisible !== undefined) publication.isPubliclyVisible = isPubliclyVisible;

    // Actualizar campos del paper
    if (paperType !== undefined) publication.paperType = paperType;
    if (sections !== undefined) {
      publication.sections = sections;
      // Also update legacy content field
      publication.content = sections.map((s: { title: string; content: string }) => `<h2>${s.title}</h2>\n${s.content}`).join("\n\n");
    }
    if (structuredAbstract !== undefined) publication.structuredAbstract = structuredAbstract;
    if (figures !== undefined) publication.figures = figures;
    if (references !== undefined) publication.references = references;
    if (meshKeywords !== undefined) publication.meshKeywords = meshKeywords;

    // Manejar cambio de estado
    if (status !== undefined) {
      if (status === "published" && publication.status !== "published") {
        publication.publishedAt = new Date();
      }
      publication.status = status;
    }

    await publication.save();

    return NextResponse.json(publication);
  } catch (error) {
    console.error("Error al actualizar publicación:", error);
    return NextResponse.json(
      { error: "Error al actualizar publicación" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar publicación
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.approved) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de publicación requerido" },
        { status: 400 }
      );
    }

    const publication = await Publication.findById(id);

    if (!publication) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // Solo autor o admin pueden eliminar
    const isAuthor = publication.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta publicación" },
        { status: 403 }
      );
    }

    await publication.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    return NextResponse.json(
      { error: "Error al eliminar publicación" },
      { status: 500 }
    );
  }
}
