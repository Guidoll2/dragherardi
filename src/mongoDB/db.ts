import mongoose from "mongoose";

const connectionString = `mongodb+srv://guidoll:Ellesar33.@emplearg.mongocluster.cosmos.azure.com/dragherardi?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`;

if (!connectionString) {
  throw new Error(
    "Por favor, proporciona una cadena de conexión válida para MongoDB."
  );
}

const connectDB = async () => {
  if (mongoose.connection?.readyState >= 1) {
    console.log("---Ya conectado a MongoDB---");
    return;
  }

  try {
    console.log("---Conectando a MongoDB---");
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000, // Tiempo para determinar si el servidor está disponible
    });
    console.log("---Conexión exitosa a MongoDB---");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw error; // Lanza el error para manejarlo adecuadamente
  }
};

export default connectDB;
