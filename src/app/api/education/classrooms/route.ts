import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserInfo } from "@/lib/utils/auth";
import connectToDatabase from "@/mongoDB/db";
import ClassroomModel from "@/mongoDB/models/classroom";

export async function GET(req: NextRequest) {
  try {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectToDatabase();

    let classrooms;
    if (userInfo.role === "admin") {
      // Admin ve todas las aulas que creó
      classrooms = await ClassroomModel.find({ instructorId: userInfo.id }).sort({ createdAt: -1 });
    } else {
      // Estudiantes ven aulas donde están inscritos o todas las activas
      classrooms = await ClassroomModel.find({
        $or: [
          { students: userInfo.id },
          { isActive: true }
        ]
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ classrooms });
  } catch (error) {
    console.error("Error getting classrooms:", error);
    return NextResponse.json({ error: "Error al obtener aulas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo || userInfo.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, coverImage } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    await connectToDatabase();

    const classroom = await ClassroomModel.create({
      name,
      description,
      instructorId: userInfo.id,
      instructorName: userInfo.name,
      students: [],
      isActive: true,
      coverImage: coverImage || "",
    });

    return NextResponse.json({ classroom }, { status: 201 });
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json({ error: "Error al crear aula" }, { status: 500 });
  }
}
