import sgMail from "@sendgrid/mail";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  const msg = {
    to,
    from: process.env.EMAIL_FROM || "no-reply@example.com",
    subject,
    text: text || "",
    html: html || "",
  };

  try {
    const response = await sgMail.send(msg);
    console.log("Correo enviado:", response);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw new Error("Error enviando el correo");
  }
};

export default sendEmail;
