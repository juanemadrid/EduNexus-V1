'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Building2, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Users,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Ensure we are in the master database context by clearing any tenant-specific configs
  useEffect(() => {
    sessionStorage.removeItem('edunexus_tenant_config');
    localStorage.removeItem('edunexus_tenant');
  }, [pathname]);
  
  const menuItems = [
    { name: 'Dashboard', icon: <BarChart3 size={20} />, href: '/super-admin' },
    { name: 'Instituciones', icon: <Building2 size={20} />, href: '/super-admin/institutions' },
    { name: 'Membresías', icon: <CreditCard size={20} />, href: '/super-admin/memberships' },
    { name: 'Configuración', icon: <Settings size={20} />, href: '/super-admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('edunexus_user');
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: '#1e293b', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#3b82f6', letterSpacing: '-1px', margin: 0 }}>EduNexus</h1>
          <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase' }}>Super Administrador</p>
        </div>

        <nav style={{ flex: 1, padding: '20px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: isActive ? 'white' : '#94a3b8',
                    background: isActive ? '#3b82f6' : 'transparent',
                    fontWeight: '700',
                    transition: '0.2s'
                  }}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            cursor: 'pointer',
            fontWeight: '700'
          }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '40px' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px' 
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Bienvenido, Admin</h2>
            <p style={{ color: '#64748b', margin: 0 }}>Panel de Control Maestro</p>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Bell size={20} color="#64748b" />
              <span style={{ 
                position: 'absolute', 
                top: '-4px', 
                right: '-4px', 
                width: '12px', 
                height: '12px', 
                background: '#ef4444', 
                borderRadius: '50%', 
                border: '2px solid #f8fafc' 
              }}></span>
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: '#3b82f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: '900'
            }}>SA</div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
