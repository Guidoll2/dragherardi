// app/api/posts/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/mongoDB/db";
import Post from "@/mongoDB/models/post";

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
    return NextResponse.json(
      { error: "Error al obtener los posts." },
      { status: 500 }
    );
  }
}
