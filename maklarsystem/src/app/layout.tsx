import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/lib/supabase-provider";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@/components/ui/toaster";
// Removed Supabase imports since auth is disabled

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mäklarsystem - Professionellt fastighetssystem",
  description: "Ett komplett system för fastighetsmäklare",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Since authentication is disabled, pass null session
  const session = null;

  return (
    <html lang="sv">
      <body className={inter.className}>
        <SupabaseProvider session={session}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
