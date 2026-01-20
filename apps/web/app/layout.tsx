import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import { AppearanceProvider } from "@/components/appearance-provider"
import { ToastProvider } from "@/components/ui/toast"
import { AuthProvider } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar/Navbar"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FloodWatch",
  description: "Report and track real-world flooding, street by street",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AppearanceProvider>
              <ToastProvider>
                <Navbar />
                {children}
              </ToastProvider>
            </AppearanceProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
