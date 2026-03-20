'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <h1 className="heading-premium" style={{ fontSize: '32px', fontWeight: '800' }}>Configuración</h1>
      <p style={{ color: 'var(--text-dim)', marginTop: '10px' }}>Ajustes globales de la institución y permisos de usuario.</p>
    </DashboardLayout>
  );
}
