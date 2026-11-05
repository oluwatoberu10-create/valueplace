import type { Metadata } from "next";
import { Gloock, Instrument_Sans } from "next/font/google";
import { CartDrawer, MobileCartBar } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const display = Gloock({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-gloock" });
const body = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: { default: "Value Plus Place Restaurant", template: "%s | Value Plus Place Restaurant" },
  description:
    "Good food. Great taste. Value plus. Browse the menu and order directly from Value Plus Place Restaurant.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <div id="content">{children}</div>
        <Footer />
        <CartDrawer />
        <MobileCartBar />
      </body>
    </html>
  );
}
