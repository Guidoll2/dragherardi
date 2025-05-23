// src/lib/utils/sendEmail.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  from?: string; // 'from' property is now optional
  subject: string;
  text: string;
  html?: string; // Optional HTML content
}

/**
 * Envía un correo electrónico utilizando Nodemailer.
 *
 * @param options Las opciones del correo electrónico, incluyendo destinatario, asunto, texto y HTML opcional.
 */
const sendEmail = async (options: EmailOptions) => {
  // Configura tu transportador de correo electrónico
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define las opciones del correo electrónico
  const mailOptions = {
    from: options.from || process.env.EMAIL_FROM, // Usa options.from si se proporciona, de lo contrario, usa env.EMAIL_FROM
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Envía el correo electrónico
  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado con éxito");
  } catch (error: unknown) { // Cambiado de 'any' a 'unknown'
    console.error("Error al enviar el correo:");

    // Verifica si el error es una instancia de Error para acceder a sus propiedades
    if (error instanceof Error) {
      console.error("Mensaje de error:", error.message);
      // Nodemailer puede añadir propiedades específicas al error, como 'code' o 'response'
      // Para acceder a ellas de forma segura, puedes castear a 'any' solo para la depuración
      // o definir una interfaz más específica para los errores de Nodemailer si los conoces bien.
      const nodemailerError = error as any; // Casteo temporal para acceder a propiedades no estándar
      if (nodemailerError.code) {
        console.error("Código de error:", nodemailerError.code);
      }
      if (nodemailerError.response) {
        console.error("Detalles de la respuesta:", nodemailerError.response);
      }
    } else {
      // Si el error no es una instancia de Error, imprímelo tal cual
      console.error("Error desconocido:", error);
    }
    throw new Error("Error enviando el correo");
  }
};

export default sendEmail;