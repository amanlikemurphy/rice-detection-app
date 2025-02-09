'use client'

import './globals.css'
import React from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body 
        className="min-h-screen bg-background antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
