"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/header";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";

export default function PostsPage() {
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;

    if (!user) {
      alert("Debes iniciar sesión para publicar.");
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postText,
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        }),
      });

      if (res.ok) {
        setPostText("");
        const newPost = await res.json();
        setPosts([newPost, ...posts]);
      } else {
        const error = await res.json();
        alert("Error: " + error.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error de red.");
    }
  };

  return (
    <div>
      <Header />
      <div className="max-w-xl mx-auto mt-4 p-4 min-h-screen bg-[#2d2d2d] border-8 border-[#1f1f1f] rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
        <h1 className="text-3xl font-handwriting text-white text-center mb-6">
          🧠 Comparte tus ideas
        </h1>

        <SignedIn>
          <form onSubmit={handlePostSubmit} className="mb-8">
            <textarea
              className="w-full p-3 bg-transparent border-2 border-dashed border-[#4CAF50] rounded-lg text-[#FAFAFA] placeholder-[#A5D6A7] focus:outline-none focus:ring-2 focus:ring-[#81C784] focus:border-[#81C784] resize-none shadow-inner"
              placeholder="Escribe aquí..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={3}
            />
            <button
              type="submit"
              className="w-full mt-3 bg-[#4CAF50] text-[#2d2d2d] font-bold py-2 rounded-lg shadow-md hover:bg-[#81C784] transition-colors"
            >
              ✍️ Publicar
            </button>
          </form>
        </SignedIn>

        <SignedOut>
          <div className="absolute inset-0 backdrop-blur-sm bg-black/40 rounded-2xl flex items-center justify-center z-10">
            <div className="text-center text-white">
              <p className="mb-4 text-lg">
                Inicia sesión para compartir tus ideas
              </p>
              <SignInButton mode="modal">
                <button className="bg-[#4CAF50] text-[#2d2d2d] font-bold px-6 py-2 rounded-lg shadow hover:bg-[#81C784] transition">
                  Iniciar sesión
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>

        <div className="space-y-4 z-0 relative">
          {posts.map((post, i) => (
            <div
              key={i}
              className="p-4 bg-[#3a3a3a] border border-[#4CAF50] rounded-lg text-[#E8F5E9] shadow-sm"
            >
              <p className="mb-2 whitespace-pre-line">{post.content}</p>
              <span className="text-xs text-[#A5D6A7] block">
                Publicado por {post.firstName} {post.lastName} el{" "}
                {new Date(post.createdAt).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
