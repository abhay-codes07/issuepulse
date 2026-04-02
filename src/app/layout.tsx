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
          colorTextSecondary: "#CBD5E1",
          colorInputBackground: "#252A3A",
          colorInputText: "#F8FAFC",
          colorNeutral: "#F8FAFC",
          colorTextOnPrimaryBackground: "#FFFFFF",
          colorShimmer: "#252A3A",
          fontSize: "1rem",
        },
        elements: {
          /* Social / OAuth buttons */
          socialButtonsBlockButton:
            "bg-[#252A3A] border border-white/20 text-white hover:bg-[#2E3448]",
          socialButtonsBlockButtonText: "text-white font-medium",
          /* GitHub icon — invert to make it white on dark bg */
          providerIcon__github: "invert",
          /* Card */
          card: "bg-[#1A1D2E] shadow-2xl shadow-black/60",
          /* Header */
          headerTitle: "text-white text-xl font-bold",
          headerSubtitle: "text-slate-300",
          /* Divider */
          dividerText: "text-slate-400 text-xs",
          dividerLine: "bg-white/15",
          /* Form */
          formFieldLabel: "text-slate-300 text-sm font-medium",
          formFieldInput:
            "bg-[#252A3A] border border-white/20 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20",
          formButtonPrimary:
            "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-none",
          /* Footer */
          footerActionText: "text-slate-400",
          footerActionLink: "text-indigo-400 hover:text-indigo-300 font-medium",
          /* Internal branding */
          footer: "text-slate-500",
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
