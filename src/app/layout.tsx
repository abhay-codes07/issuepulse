import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IssuePulse — GitHub Issue Notification Tracker",
  description:
    "Monitor open source repositories and get notified instantly when issues matching your chosen labels are created or updated.",
  keywords: ["github", "issues", "notifications", "open source", "tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366F1",
          colorBackground: "#1A1D2E",
          colorText: "#F8FAFC",
          colorInputBackground: "#252A3A",
          colorInputText: "#F8FAFC",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#0F1117]">
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1A1D2E",
                color: "#F8FAFC",
                border: "1px solid rgba(99,102,241,0.2)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
