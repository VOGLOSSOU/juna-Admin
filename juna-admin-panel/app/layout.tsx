import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "JUNA Admin",
  description: "Panel d'administration JUNA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full antialiased">
        <AuthProvider>
          <SidebarProvider>
            {children}
            <Toaster position="top-right" />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
