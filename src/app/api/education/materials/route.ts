import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserInfo } from "@/lib/utils/auth";
import connectToDatabase from "@/mongoDB/db";
import EducationalMaterialModel from "@/mongoDB/models/educationalMaterial";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");

    if (!classroomId) {
      return NextResponse.json({ error: "classroomId requerido" }, { status: 400 });
    }

    await connectToDatabase();

    const materials = await EducationalMaterialModel.find({ classroomId })
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ materials });
  } catch (error) {
    console.error("Error getting materials:", error);
    return NextResponse.json({ error: "Error al obtener materiales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo || userInfo.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { classroomId, title, description, type, content, fileUrl, externalLink, order } = body;

    if (!classroomId || !title || !description || !type) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    await connectToDatabase();

    const material = await EducationalMaterialModel.create({
      classroomId,
      title,
      description,
      type,
      content: content || "",
      fileUrl: fileUrl || "",
      externalLink: externalLink || "",
      uploadedBy: userInfo.id,
      uploadedByName: userInfo.name,
      order: order || 0,
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json({ error: "Error al crear material" }, { status: 500 });
  }
}
