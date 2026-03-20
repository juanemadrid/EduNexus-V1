// Centralized institutional parameters to maintain consistency across the app

export interface Sede {
  id: string;
  nombre: string;
  direccion?: string;
}

export interface Jornada {
  id: string;
  nombre: string;
}

export interface Periodo {
  id: string;
  nombre: string;
  activo: boolean;
}

export const SEDES: Sede[] = [
  { id: '1', nombre: 'Sede Principal - Centro', direccion: 'Calle 10 # 5-20' },
  { id: '2', nombre: 'Sede Norte - Campestre', direccion: 'Km 5 Vía al Mar' },
  { id: '3', nombre: 'Sede Virtual', direccion: 'Online' },
];

export const JORNADAS: Jornada[] = [
  { id: 'mat', nombre: 'Mañana' },
  { id: 'tar', nombre: 'Tarde' },
  { id: 'noc', nombre: 'Noche' },
  { id: 'fin', nombre: 'Fin de Semana' },
  { id: 'uni', nombre: 'Única' },
];

export const PERIODOS: Periodo[] = [
  { id: '2024-1', nombre: 'Primer Semestre 2024', activo: false },
  { id: '2024-2', nombre: 'Segundo Semestre 2024', activo: true },
  { id: '2025-1', nombre: 'Primer Semestre 2025', activo: false },
];

export const TIPOS_IDENTIFICACION = [
  'Cédula de Ciudadanía (CC)',
  'Tarjeta de Identidad (TI)',
  'Cédula de Extranjería (CE)',
  'Pasaporte (PA)',
  'Permiso Especial de Permanencia (PEP)',
  'Permiso por Protección Temporal (PPT)',
  'Registro Civil (RC)',
];

export const GENEROS = [
  'Masculino',
  'Femenino',
  'No binario',
  'Otro',
  'Prefiero no decirlo'
];

// Combined Sede-Jornada options (as Q10 does it in a single dropdown)
export const SEDES_JORNADAS: string[] = SEDES.flatMap(sede =>
  JORNADAS.map(jornada => `${sede.nombre} - ${jornada.nombre}`)
);
