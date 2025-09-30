import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import toast, { Toaster } from "react-hot-toast";



export const metadata: Metadata = {
  title: 'CS CRM',
  description: 'Admin Panel for Lead Management',
  generator: 'Lead CRM Dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/cs logo.svg" type="image/svg+xml" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {children}
        <Toaster position="top-center" 
        toastOptions={{
            duration: 3000, // default
            success: {
              duration: 3000,
            },
            error: {
              duration: 3000,// error toasts stay 3 sec
            },
          }}
        />
      </body>
    </html>
  )
}
