import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Replacing with Inter temporarily or custom Pretendard logic if files exist.
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "우리동네 떨이",
  description: "지역 기반 실시간 마감 할인 마켓",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
