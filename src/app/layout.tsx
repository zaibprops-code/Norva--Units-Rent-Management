// =============================================================================
// ROOT LAYOUT
// Applied to all pages. Sets up fonts, metadata, and global providers.
// =============================================================================
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Norva — Rental Portfolio Operations",
    template: "%s | Norva",
  },
  description:
    "Autonomous operations platform for rental portfolios. Monitor properties, automate rent follow-up, and coordinate maintenance — all in one place.",
  keywords: ["property management", "landlord software", "rent tracking", "rental operations"],
  robots: {
    index: false, // Private SaaS — don't index by default
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0d1b2a",
              color: "#f5f4f0",
              fontSize: "13px",
              borderRadius: "8px",
              padding: "10px 14px",
            },
            success: {
              iconTheme: {
                primary: "#00c2a8",
                secondary: "#0d1b2a",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#f5f4f0",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
