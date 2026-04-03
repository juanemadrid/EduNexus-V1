import './globals.css';
import React from 'react';

export const metadata = {
  title: 'EduNexus - Innovación Educativa de Próxima Generación',
  description: 'Plataforma administrativa y académica de élite.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Outfit:wght@400;700;900&family=Space+Grotesk:wght@400;700;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body>
        <div className="aurora-container">
          <div className="background-image"></div>
        </div>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        ` }} />
      </body>
    </html>
  );
}
