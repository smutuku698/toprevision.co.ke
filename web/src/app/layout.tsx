import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CBC Quizmaster",
  description: "Parameterized CBC practice questions for every grade, generated on the fly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
