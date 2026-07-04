import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthShell } from "@/components/auth/AuthShell";
import { DataLayerProvider } from "@/components/providers/DataLayerProvider";
import { SyncWorkerProvider } from "@/components/providers/SyncWorkerProvider";
import { AppSyncProvider } from "@/components/providers/AppSyncProvider";
import { SupabaseConfigGuard } from "@/components/providers/SupabaseConfigGuard";
import { AuthProvider } from "@/contexts/AuthContext";
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
  title: "Comandero · La Taberneta de Ca la Ingrid",
  description:
    "Comandero web para camareros — La Taberneta de Ca la Ingrid",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Comandero",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c2d12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseConfigGuard>
          <DataLayerProvider>
            <AuthProvider>
              <SyncWorkerProvider>
                <AppSyncProvider>
                  <AuthShell>{children}</AuthShell>
                </AppSyncProvider>
              </SyncWorkerProvider>
            </AuthProvider>
          </DataLayerProvider>
        </SupabaseConfigGuard>
      </body>
    </html>
  );
}
