import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { Toaster } from 'sonner';
import { Poppins } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Neurociencia Doctoral - Dra.Gherardi A",
  description: "Plataforma de desarrollo de tesis doctoral en neurociencia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esMX}>
      <html lang="en">
        <body className={`${poppins.variable} antialiased`}>
          <SessionProvider>
            {children}
          </SessionProvider>
          <Toaster position="bottom-left" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}