// app/api/posts/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/mongoDB/db";
import Post from "@/mongoDB/models/post";
import { NextRequest } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { content, userId, firstName, lastName } = body;

    if (!content || !userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    const newPost = await Post.create({
      content,
      userId,
      firstName,
      lastName,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error al crear el post:", error);
    return NextResponse.json(
      { error: "Error al crear el post." },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los posts:", error); // <-- Agregado para usar 'error'
    return NextResponse.json(
      { error: "Error al obtener los posts." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  try {
    const { id, content, userId } = await req.json();
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Post no encontrado." }, { status: 404 });
    if (post.userId !== userId) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    post.content = content;
    await post.save();
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al editar el post." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { id, userId } = await req.json();
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Post no encontrado." }, { status: 404 });
    if (post.userId !== userId) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    await post.deleteOne();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al borrar el post." }, { status: 500 });
  }
}
