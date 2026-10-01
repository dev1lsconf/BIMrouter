import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JEV BIM Router",
  description: "Demostración local de routing BIM con JEV y OpenRouter.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
