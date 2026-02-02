import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserInfo } from "@/lib/utils/auth";
import connectToDatabase from "@/mongoDB/db";
import EducationalMaterialModel from "@/mongoDB/models/educationalMaterial";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo || userInfo.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const materialId = params.id;
    const body = await req.json();
    const { title, description, type, content, fileUrl, externalLink, order } = body;

    await connectToDatabase();

    const material = await EducationalMaterialModel.findByIdAndUpdate(
      materialId,
      {
        title,
        description,
        type,
        content: content || "",
        fileUrl: fileUrl || "",
        externalLink: externalLink || "",
        order: order || 0,
      },
      { new: true }
    );

    if (!material) {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ material });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json({ error: "Error al actualizar material" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo || userInfo.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const materialId = params.id;

    await connectToDatabase();

    const material = await EducationalMaterialModel.findByIdAndDelete(materialId);

    if (!material) {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Material eliminado" });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ error: "Error al eliminar material" }, { status: 500 });
  }
}
