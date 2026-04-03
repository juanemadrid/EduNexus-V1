'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';

interface Profile {
  id: string;
  name: string;
  assignedPermissions: string[];
}

export function usePermissions() {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      try {
        // En un entorno real, esto vendría del usuario autenticado
        // Para EduNexus, simularemos que el usuario actual tiene el perfil "Rectoría Master"
        // o buscaremos el perfil del usuario guardado en localStorage
        const savedUser = localStorage.getItem('edunexus_user');
        const user = savedUser ? JSON.parse(savedUser) : { role: 'ADMIN' };

        if (user.role === 'ADMIN') {
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // Si no es admin global, buscamos sus permisos asignados en Firestore
        // Buscamos el perfil por defecto o el asignado
        const profiles = await db.list<Profile>('profiles');
        const userProfile = profiles.find(p => p.name === 'Rectoría Master') || profiles[0];
        
        if (userProfile) {
          setUserPermissions(userProfile.assignedPermissions || []);
        }
      } catch (error) {
        console.error("Error loading permissions hook:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPermissions();
  }, []);

  const hasPermission = (permissionId: string) => {
    if (isAdmin) return true;
    return userPermissions.includes(permissionId);
  };

  return { hasPermission, isLoading, isAdmin };
}
