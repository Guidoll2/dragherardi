// src/lib/utils/sendEmail.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  from?: string; // 'from' property is now optional
  subject: string;
  text: string;
  html?: string; // Optional HTML content
}

// Define an interface for Nodemailer-specific errors, extending the standard Error interface.
interface NodemailerError extends Error {
  code?: string;
  response?: string;
  responseCode?: number; // Nodemailer might also include a responseCode
}

/**
 * Type guard to check if an unknown error is a NodemailerError.
 * This allows safe access to Nodemailer-specific properties like 'code' and 'response'.
 * @param error The unknown error to check.
 * @returns True if the error is a NodemailerError, false otherwise.
 */
function isNodemailerError(error: unknown): error is NodemailerError {
  return (
    error instanceof Error &&
    (typeof (error as NodemailerError).code === 'string' ||
     typeof (error as NodemailerError).response === 'string' ||
     typeof (error as NodemailerError).responseCode === 'number')
  );
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
  } catch (error: unknown) { // 'error' is now of type 'unknown'
    console.error("Error al enviar el correo:");

    // Use the type guard to safely narrow the type of 'error'
    if (isNodemailerError(error)) {
      console.error("Mensaje de error:", error.message);
      if (error.code) {
        console.error("Código de error:", error.code);
      }
      if (error.response) {
        console.error("Detalles de la respuesta:", error.response);
      }
      if (error.responseCode) {
        console.error("Código de respuesta:", error.responseCode);
      }
    } else if (error instanceof Error) {
      // Handle other standard Error instances
      console.error("Mensaje de error (Error estándar):", error.message);
    } else {
      // Handle truly unknown errors
      console.error("Error desconocido (no es una instancia de Error):", error);
    }
    throw new Error("Error enviando el correo");
  }
};

export default sendEmail;
