import mongoose from "mongoose";

const connectionString = process.env.MONGODB_URI!;

if (!connectionString) {
  throw new Error("Por favor, proporciona una cadena de conexión válida para MongoDB.");
}

// 👇 NO USAR 'global'. USAR 'globalThis'
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log("---Ya conectado a MongoDB---");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("---Conectando a MongoDB---");
    cached.promise = mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    }).then((m) => {
      console.log("---Conexión exitosa a MongoDB---");
      return m;
    }).catch((error) => {
      console.error("Error al conectar a MongoDB:", error);
      cached.promise = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
