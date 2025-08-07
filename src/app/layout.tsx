import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/src/app/styles/global.css"; // Corrected import path for global styles
import { ThemeProvider } from "@/src/app/components/theme-provider"; // Corrected path alias
import { Navbar } from "@/src/app/components/Navbar"; // Corrected path alias
import { Footer } from "@/src/app/components/Footer"; // Added Footer import
import { BetterAuthProvider } from "@/src/contexts/BetterAuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EYN - Everything You Need",
  description: "Your one-stop destination for everything.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BetterAuthProvider>
            <Navbar />
            <main className="min-h-screen pt-14">{children}</main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </BetterAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
