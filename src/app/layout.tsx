import type { Metadata } from "next";
import { Libre_Baskerville, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Libre_Baskerville({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mastermind — Two-player online",
  description:
    "Play classic Mastermind online with a friend. Alternate setting and breaking codes across two rounds.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="felt-bg min-h-full flex flex-col font-[family-name:var(--font-body)] text-[#f3e6d0]">
        {children}
      </body>
    </html>
  );
}
