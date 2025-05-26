"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/header";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

type Post = {
  _id?: string;
  content: string;
  userId: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

export default function PostsPage() {
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
    const [language, setLanguage] = useState("EN");

  useEffect(() => {
    const savedLanguage = Cookies.get("language");
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  // Cambiar idioma y guardar en cookie
  const handleLanguageChange = () => {
    const newLanguage = language === "ES" ? "EN" : "ES";
    setLanguage(newLanguage);
    Cookies.set("language", newLanguage, { expires: 365 });
  };

  useEffect(() => {

      const cached = localStorage.getItem("posts");
  if (cached) {
    try {
      setPosts(JSON.parse(cached));
    } catch {}
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
      localStorage.setItem("posts", JSON.stringify(data));
    } catch {
      toast.error("Error al cargar los posts.");
    }
  };
  fetchPosts();
}, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;

    if (!user) {
      toast.error("Debes iniciar sesión para publicar.");
      return;
    }

    toast.loading("Publicando...");
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

      toast.dismiss();
       if (res.ok) {
    setPostText("");
    const newPost = await res.json();
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
    toast.success("¡Post publicado!");
  }else {
        const error = await res.json();
        toast.error("Error: " + error.error);
      }
    } catch  {
      toast.dismiss();
      toast.error("Error de red.");
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    toast.loading("Borrando post...");
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId: user?.id }),
      });
      toast.dismiss();
       if (res.ok) {
    const updatedPosts = posts.filter((p) => p._id !== id);
    setPosts(updatedPosts);
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
    toast.success("Post borrado.");
  } else {
        const error = await res.json();
        toast.error(error.error || "Error al borrar.");
      }
    } catch {
      toast.dismiss();
      toast.error("Error de red.");
    }
  };

  const handleEdit = async (id: string | undefined) => {
    if (!id) return;
    if (!editText.trim()) return toast.error("El contenido no puede estar vacío.");
    toast.loading("Editando post...");
    try {
      const res = await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content: editText, userId: user?.id }),
      });
      toast.dismiss();
      if (res.ok) {
    const updated = await res.json();
    const updatedPosts = posts.map((p) => (p._id === id ? updated : p));
    setPosts(updatedPosts);
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
    setEditingId(null);
    toast.success("Post editado.");
  } else {
        const error = await res.json();
        toast.error(error.error || "Error al editar.");
      }
    } catch {
      toast.dismiss();
      toast.error("Error de red.");
    }
  };

  return (
<div
  className="relative min-h-screen bg-cover bg-center overflow-auto"
  style={{
    backgroundImage:
      "url('https://images.pexels.com/photos/20657537/pexels-photo-20657537.jpeg')", // Aula universitaria vacía
    backgroundAttachment: "fixed",

    filter: "blur(0px)",
  }}
>
    {/* Overlay oscuro para resaltar el board */}
    <div className="absolute z-[100] bg-black/40" />
   <Header language={language} onLanguageChange={handleLanguageChange} />

    {/* Botón de idioma */}
<div className="absolute top-16 left-8 z-20">
  <button
    onClick={handleLanguageChange}
    className="text-sm border p-2 rounded-lg font-semibold text-gray-700 bg-emerald-200 hover:bg-purple-200 shadow-lg"
  >
    EN | ES
  </button>
</div>

<div
  className="
    max-w-3xl mx-auto mt-10 p-6 min-h-screen relative z-10
    rounded-[32px] shadow-[0_0_60px_rgba(0,0,0,0.7)]
    border-[12px] border-[#bfa76a]  // Marco madera
    bg-[#20402b] md:bg-[url('/chalkboard-texture.png'),#20402b]
    bg-blend-multiply
    flex flex-col
    md:scale-105
    "
  style={{
    boxShadow: "0 8px 40px 8px rgba(0,0,0,0.7)",
    borderImage: "linear-gradient(120deg,#bfa76a 60%,#a67c52 100%) 1",
    backgroundSize: "cover",
    backgroundRepeat: "repeat",
  }}
>
  <h1 className="text-4xl font-handwriting text-white text-center mb-8 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
  {language === "EN"
    ? "🧠 Share your ideas or thoughts"
    : "🧠 Comparte tus ideas o pensamientos"}
</h1>

         <SignedIn>
        <form onSubmit={handlePostSubmit} className="mb-8">
          <textarea
            className="w-full p-3 bg-transparent border-2 border-dashed border-[#fff9c4] rounded-lg text-[#fffde7] placeholder-[#ffe082] focus:outline-none focus:ring-2 focus:ring-[#fff59d] focus:border-[#fff59d] resize-none shadow-inner font-handwriting text-lg"
           placeholder={language === "EN" ? "Welcome..." : "Bienvenidos..."}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={3}
          />
          <button
            type="submit"
            className="w-full mt-3 bg-[#fff176] text-[#20402b] font-bold py-2 rounded-lg shadow-md hover:bg-[#fffde7] transition-colors font-handwriting text-lg"
          >
            ✍️ {language === "EN" ? "Post" : "Publicar"}
          </button>
        </form>
      </SignedIn>
        <SignedOut>
          <div className="absolute inset-0 backdrop-blur-sm bg-black/40 rounded-2xl flex items-center justify-center z-10">
            <div className="text-center text-white">
              <p className="mb-4 text-lg">
                 {language === "EN" ? "Log in to share your ideas" : "Inicia sesión para compartir tus ideas"} 
              </p>
              <SignInButton mode="modal">
                <button className="bg-[#4CAF50] text-[#2d2d2d] font-bold px-6 py-2 rounded-lg shadow hover:bg-[#81C784] transition">
                  {language === "EN" ? "Login" : "Iniciar Sesión"}
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>

            <div className="space-y-4 z-0 relative">
        {posts.map((post, i) => (
          <div
            key={post._id || i}
            className="p-4 bg-[#2a4d34]/80 border border-[#fff9c4] rounded-lg text-[#fffde7] shadow-[0_2px_8px_rgba(0,0,0,0.3)] relative font-handwriting text-lg"
            style={{
              textShadow: "0 1px 0 #fff9c4, 0 0 2px #fff",
            }}
          >
{editingId === post._id ? (
  <form
    onSubmit={e => {
      e.preventDefault();
      handleEdit(post._id);
    }}
  >
    <textarea
      className="w-full p-3 bg-[#232323] border-2 border-[#4CAF50] rounded-lg text-[#FAFAFA] placeholder-[#A5D6A7] focus:outline-none focus:ring-2 focus:ring-[#81C784] focus:border-[#81C784] resize-none shadow-inner"
      value={editText}
      onChange={e => setEditText(e.target.value)}
      rows={5} // Más grande
      style={{ minHeight: "100px" }} // Opcional: asegura altura mínima
    />
    <div className="flex gap-2 mt-2">
      <button type="submit" className="bg-[#4CAF50] px-3 py-1 rounded text-[#2d2d2d]">{language === "EN" ? "Save" : "Guardar"}</button>
      <button type="button" className="bg-gray-500 px-3 py-1 rounded text-white" onClick={() => setEditingId(null)}> {language === "EN" ? "Cancel" : "Cancelar"}</button>
    </div>
  </form>
) : (
                <>
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
                  {user?.id === post.userId && (
                    <div className="absolute bottom-4 right-2 flex gap-2">
                      <button
                        className="text-xs bg-yellow-300 px-2 py-1 rounded text-black"
                        onClick={() => {
                          setEditingId(post._id!);
                          setEditText(post.content);
                        }}
                      >
                             {language === "EN" ? "Edit" : "Editar"}
                      </button>
                      <button
                        className="text-xs bg-orange-400 px-2 py-1 rounded text-white"
                        onClick={() => handleDelete(post._id)}
                      >
                          {language === "EN" ? "Delete" : "Borrar"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}