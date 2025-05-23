import mongoose from "mongoose";

const connectionString = `mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/dragherardi?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`;

if (!connectionString) {
  throw new Error(
    "Por favor, proporciona una cadena de conexión válida para MongoDB."
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If a connection already exists, return it
  if (cached.conn) {
    console.log("---Ya conectado a MongoDB---");
    return cached.conn; // Return the existing connection
  }

  // If a connection promise is already in progress, wait for it
  if (!cached.promise) {
    console.log("---Conectando a MongoDB---");
    cached.promise = mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000, // Aumentado a 30 segundos
      socketTimeoutMS: 45000,         // Añadido: Timeout para operaciones en el socket (45 segundos)
      connectTimeoutMS: 30000,        // Añadido: Tiempo para la conexión inicial (30 segundos)
      // Otras opciones que ya tienes en el connectionString son procesadas por Mongoose
    }).then((m) => {
      console.log("---Conexión exitosa a MongoDB---");
      return m;
    })
    .catch((error) => {
      console.error("Error al conectar a MongoDB:", error);
      cached.promise = null; // Clear the promise to allow retries
      throw error;
    });
  }

  // Wait for the connection promise to resolve
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;