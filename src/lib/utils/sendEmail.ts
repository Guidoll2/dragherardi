// src/lib/utils/sendEmail.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  from?: string; // <--- ADD THIS LINE: 'from' property is now optional
  subject: string;
  text: string;
  html?: string; // Optional HTML content
}

const sendEmail = async (options: EmailOptions) => {
  // Configure your email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: options.from || process.env.EMAIL_FROM, // <--- UPDATE THIS LINE: Use options.from if provided, otherwise fallback to env.EMAIL_FROM
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado con éxito");
  } catch (error: any) {
    console.error("Error al enviar el correo:", error);
    console.error("Original error details:", error.code, error.response);
    throw new Error("Error enviando el correo");
  }
};

export default sendEmail;