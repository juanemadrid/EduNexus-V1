'use client';
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_esta_config">
        <div>
          <h1 className="heading-premium" style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>Servicios Q10</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: '500' }}>
            Módulo en construcción...
          </p>
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
}
