import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caption Studio",
  description: "AI-powered social media caption generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
