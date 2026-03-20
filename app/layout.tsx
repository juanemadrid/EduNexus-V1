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
      <body>
        <div className="aurora-container">
          <div className="background-image"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
