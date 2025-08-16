import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { SupabaseProvider } from "@/utils/supabase/provider";
import { createClient } from "@/utils/supabase/server";

import { Toaster } from "@/components/ui/toaster";

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
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

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
