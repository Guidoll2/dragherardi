// app/api/publications/[id]/autosave/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/mongoDB/db";
import Publication from "@/mongoDB/models/publication";

// PATCH - Auto-save publication data
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.approved) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const publication = await Publication.findById(id);
    if (!publication) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    // Verify permissions
    const isAuthor = publication.authorId === session.user.id;
    const isCoAuthor = publication.coAuthors.some(
      (ca: { id: string }) => ca.id === session.user?.id
    );
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isCoAuthor && !isAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      summary,
      sections,
      structuredAbstract,
      figures,
      references,
      meshKeywords,
      tags,
      paperType,
    } = body;

    // Update fields that are provided
    if (title !== undefined) publication.title = title;
    if (summary !== undefined) publication.summary = summary;
    if (sections !== undefined) publication.sections = sections;
    if (structuredAbstract !== undefined) publication.structuredAbstract = structuredAbstract;
    if (figures !== undefined) publication.figures = figures;
    if (references !== undefined) publication.references = references;
    if (meshKeywords !== undefined) publication.meshKeywords = meshKeywords;
    if (tags !== undefined) publication.tags = tags;
    if (paperType !== undefined) publication.paperType = paperType;

    // Combine sections content into legacy content field
    if (sections && sections.length > 0) {
      publication.content = sections
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
        .map((s: { title: string; content: string }) => `<h2>${s.title}</h2>\n${s.content}`)
        .join("\n\n");
    }

    publication.lastAutoSave = new Date();
    await publication.save();

    return NextResponse.json({
      success: true,
      lastAutoSave: publication.lastAutoSave,
    });
  } catch (error) {
    console.error("Error en auto-save:", error);
    return NextResponse.json({ error: "Error en auto-save" }, { status: 500 });
  }
}

// POST - Save version snapshot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.approved) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const publication = await Publication.findById(id);
    if (!publication) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    const isAuthor = publication.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { label } = await req.json();

    // Keep max 20 versions
    if (publication.versionHistory.length >= 20) {
      publication.versionHistory.shift();
    }

    publication.versionHistory.push({
      savedAt: new Date(),
      label: label || `Versión ${publication.versionHistory.length + 1}`,
      sections: publication.sections,
    });

    await publication.save();

    return NextResponse.json({
      success: true,
      versions: publication.versionHistory.length,
    });
  } catch (error) {
    console.error("Error saving version:", error);
    return NextResponse.json({ error: "Error saving version" }, { status: 500 });
  }
}
