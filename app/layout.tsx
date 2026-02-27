import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brand Factory - Crea tu Marca con IA",
  description: "Estrategia + Identidad Visual + Plan Digital. Todo en minutos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="gradient-bg min-h-screen text-white antialiased">
        {children}
      </body>
    </html>
  );
}
