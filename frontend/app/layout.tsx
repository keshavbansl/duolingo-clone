import AppLayout from "@/components/layout/AppLayout";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Duolingo Clone",
  description:
    "A playful language-learning application inspired by Duolingo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <main className="min-h-screen bg-background text-foreground">
          <AppLayout>{children}</AppLayout>
        </main>
      </body>
    </html>
  );
}
