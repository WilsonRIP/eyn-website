import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/src/app/styles/global.css"; // Corrected import path for global styles
import { ThemeProvider } from "@/src/app/components/theme-provider"; // Corrected path alias
import { Navbar } from "@/src/app/components/Navbar"; // Corrected path alias

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
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
