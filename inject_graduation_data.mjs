import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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
  console.log("Inyectando requisitos de grado reales...");

  const requirements = [
    { 
        id: 'grad_paz_acad', 
        nombre: 'PAZ Y SALVO ACADÉMICO', 
        descripcion: 'CERTIFICACIÓN DE CUMPLIMIENTO DE TODAS LAS ASIGNATURAS DEL PLAN DE ESTUDIOS.', 
        programas: 'TODOS', 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_inst', 
        estado: 'Activo' 
    },
    { 
        id: 'grad_paz_fin', 
        nombre: 'PAZ Y SALVO FINANCIERO', 
        descripcion: 'ESTAR AL DÍA CON TODO CONCEPTO DE PENSIONES Y OTROS COBROS.', 
        programas: 'TODOS', 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_inst', 
        estado: 'Activo' 
    },
    { 
        id: 'grad_paz_bib', 
        nombre: 'PAZ Y SALVO BIBLIOTECA', 
        descripcion: 'DEVOLUCIÓN DE TODOS LOS TEXTOS Y MATERIALES PEDAGÓGICOS.', 
        programas: 'TODOS', 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_inst', 
        estado: 'Activo' 
    },
    { 
        id: 'grad_acta_ant', 
        nombre: 'COPIA ACTA DE GRADO ANTERIOR', 
        descripcion: 'PARA ESTUDIANTES QUE INGRESARON EN GRADOS SUPERIORES.', 
        programas: 'TODOS', 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_acad', 
        estado: 'Activo' 
    },
    { 
        id: 'grad_saber11', 
        nombre: 'PRUEBAS SABER 11 (ICFES)', 
        descripcion: 'REQUISITO INDISPENSABLE PARA ESTUDIANTES DE GRADO 11°.', 
        programas: 'TODOS', // In a real scenario, this might be only for Bachillerato program
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_acad', 
        estado: 'Activo' 
    },
    { 
        id: 'grad_social', 
        nombre: 'CONSTANCIA SERVICIO SOCIAL', 
        descripcion: 'CERTIFICADO DE CUMPLIMIENTO DE LAS 72 HORAS DE LEY.', 
        programas: 'TODOS', 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_acad', 
        estado: 'Activo' 
    },
    { 
        id: 'grad_derechos', 
        nombre: 'PAGO DERECHOS DE GRADO', 
        descripcion: 'COMPROBANTE DE PAGO DE LA CEREMONIA Y DERECHOS LEGALES.', 
        programas: 'TODOS', 
        requiereAdjunto: true, 
        categoriaArchivoId: 'cat_inst', 
        estado: 'Activo' 
    }
  ];

  for (const req of requirements) {
    await setDoc(doc(db, col("graduation_requirements"), req.id), {
        ...req,
        createdAt: new Date().toISOString()
    });
    console.log(`✓ Requisito de Grado Inyectado: ${req.nombre}`);
  }

  console.log("¡Inyección de requisitos de grado completada!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
