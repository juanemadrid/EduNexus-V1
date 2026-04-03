// Centralized institutional parameters
// IMPORTANT: Most of these are legacy hardcoded arrays. 
// For production, always prefer fetching dynamic data via `db.list('sedes')`, `db.list('academic_periods')`, etc.

export interface Sede {
  id: string;
  nombre: string;
  direccion?: string;
  jornadas?: any[];
}

export interface Jornada {
  id: string;
  nombre: string;
}

export interface Periodo {
  id: string;
  nombre: string;
  name?: string; // Transitional
  activo: boolean;
}

// Default fallback values (use only if DB is empty)
export const DEFAULT_SEDES: Sede[] = [
  { id: '1', nombre: 'Sede Principal - Centro', direccion: 'Calle 10 # 5-20' },
];

export const DEFAULT_JORNADAS: Jornada[] = [
  { id: 'mat', nombre: 'Mañana' },
  { id: 'tar', nombre: 'Tarde' },
  { id: 'noc', nombre: 'Noche' },
  { id: 'uni', nombre: 'Única' },
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

// Re-exports for backward compatibility (transitioning to dynamic)
export const SEDES = DEFAULT_SEDES;
export const JORNADAS = DEFAULT_JORNADAS;
export const PERIODOS: Periodo[] = [
  { id: '2026-1', nombre: '2026 - 01', activo: true },
];

export const SEDES_JORNADAS: string[] = SEDES.flatMap(sede =>
  JORNADAS.map(jornada => `${sede.nombre} - ${jornada.nombre}`)
);
