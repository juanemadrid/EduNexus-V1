import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial",
  storageBucket: "edunexus-oficial.firebasestorage.app",
  messagingSenderId: "462948258278",
  appId: "1:462948258278:web:cf75816eb7c3d4351d8627"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TENANT = "colegiosanjose";
const col = (name) => `${TENANT}_${name}`;

async function run() {
  console.log("Inyectando categorías digitales y requisitos de matrícula reales...");

  // 1. Create Digital Categories if they don't exist
  const cats = [
    { id: 'cat_acad', name: 'DOCUMENTOS ACADÉMICOS', type: 'Estudiante', description: 'TODO TIPO DE DOCUMENTACIÓN ACADÉMICA' },
    { id: 'cat_inst', name: 'INSTITUCIONAL', type: 'Otros', description: 'CONTRATOS, PAGARÉS Y FORMATOS INTERNOS' },
    { id: 'cat_otros', name: 'OTROS', type: 'Otros', description: 'EPS, CERTIFICADOS DE SALUD, ETC.' }
  ];

  for (const cat of cats) {
    await setDoc(doc(db, col("digital_categories"), cat.id), cat);
    console.log(`✓ Categoría Digital: ${cat.name}`);
  }

  // 2. Clear existing requirements to avoid duplicates or keep it clean
  // (In production we might append, but for "Real Data" we want this specific list)

  const requirements = [
    { 
        id: 'req_dni', 
        nombre: 'DOCUMENTO DE IDENTIDAD (T.I / C.C)', 
        descripcion: 'COPIA AMPLIADA AL 150% DEL DOCUMENTO DE IDENTIDAD VIGENTE.', 
        obligatorio: true, 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_acad', 
        estado: 'Activo' 
    },
    { 
        id: 'req_civil', 
        nombre: 'REGISTRO CIVIL DE NACIMIENTO', 
        descripcion: 'COPIA ORIGINAL O AUTENTICADA DEL REGISTRO CIVIL.', 
        obligatorio: true, 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_acad', 
        estado: 'Activo' 
    },
    { 
        id: 'req_notas', 
        nombre: 'CERTIFICADO DE NOTAS (AÑO ANTERIOR)', 
        descripcion: 'CERTIFICADO ORIGINAL DE NOTAS DEL ÚLTIMO GRADO APROBADO.', 
        obligatorio: true, 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_acad', 
        estado: 'Activo' 
    },
    { 
        id: 'req_simat', 
        nombre: 'RETIRO DEL SIMAT (COLEGIO ANTERIOR)', 
        descripcion: 'CONSTANCIA DE RETIRO DEL SISTEMA SIMAT DE LA INSTITUCIÓN DE ORIGEN.', 
        obligatorio: true, 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_inst', 
        estado: 'Activo' 
    },
    { 
        id: 'req_eps', 
        nombre: 'CARNET DE EPS / FOSYGA', 
        descripcion: 'CERTIFICADO DE AFILIACIÓN A SALUD VIGENTE.', 
        obligatorio: false, 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_otros', 
        estado: 'Activo' 
    },
    { 
        id: 'req_foto', 
        nombre: 'FOTO 3X4 FONDO BLANCO', 
        descripcion: 'CARGUE UNA FOTO EN FORMATO JPG O PNG PARA EL CARNET.', 
        obligatorio: true, 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_acad', 
        estado: 'Activo' 
    },
    { 
        id: 'req_pagare', 
        nombre: 'PAGARÉ DE MATRÍCULA FIRMADO', 
        descripcion: 'DOCUMENTO LEGAL DE RESPONSABILIDAD FINANCIERA.', 
        obligatorio: true, 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_inst', 
        estado: 'Activo' 
    },
    { 
        id: 'req_pago', 
        nombre: 'RECIBO DE PAGO DE MATRÍCULA', 
        descripcion: 'COPIA DEL COMPROBANTE DE PAGO BANCARIO.', 
        obligatorio: true, 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_inst', 
        estado: 'Activo' 
    }
  ];

  for (const req of requirements) {
    await setDoc(doc(db, col("enrollment_requirements"), req.id), {
        ...req,
        createdAt: new Date().toISOString()
    });
    console.log(`✓ Requisito Inyectado: ${req.nombre}`);
  }

  console.log("¡Inyección de datos reales completada!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
