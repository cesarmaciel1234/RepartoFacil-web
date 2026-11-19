import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase"
import { PwaRegister } from "@/components/PwaRegister"

export const metadata: Metadata = {
  title: "Reparto Fácil · Frigorífico Maciel",
  description: "Tienda online de carnicería, combos para asado y envíos a domicilio en tiempo real.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Reparto Fácil",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#020617",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-white">
        <PwaRegister />
        <FirebaseClientProvider>
          <div className="w-full min-h-screen relative">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  )
}
