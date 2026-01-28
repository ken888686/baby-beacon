import type { Metadata } from "next";
import { Nunito, Varela_Round } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const varela = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-varela",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Baby Beacon | Smart Baby Tracker",
  description: "Smart monitoring and health tracking for your little ones.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Baby Beacon",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${varela.variable} ${nunito.variable} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
