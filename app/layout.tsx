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
      </head>
      <body>
        <div className="aurora-container">
          <div className="background-image"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
