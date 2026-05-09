import './globals.css'

export const metadata = {
  title: 'BruitoMonstre — Gardien du Silence',
  description: 'Application de détection de bruit en classe',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
      </body>
    </html>
  )
}
