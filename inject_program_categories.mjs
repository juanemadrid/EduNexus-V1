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

const CATEGORIES = [
  "ACTIVIDADES FÍSICAS, DEPORTIVAS Y RECREATIVAS",
  "ADMINISTRACIÓN, FINANZAS Y DERECHO",
  "AGROPECUARIO, SILVICULTURA, PESCA, ACUICULTURA Y VETERINARIA",
  "ARTES VISUALES, PLÁSTICAS Y DEL PATRIMONIO CULTURAL",
  "AUDIOVISUALES, ARTES ESCÉNICAS Y MÚSICA",
  "CIENCIAS NATURALES, MATEMÁTICAS Y ESTADÍSTICA",
  "CIENCIAS SOCIALES Y HUMANIDADES",
  "COMERCIO, MERCADEO Y PUBLICIDAD",
  "CONSERVACIÓN, PROTECCIÓN Y SANEAMIENTO AMBIENTAL",
  "CONSTRUCCIÓN E INFRAESTRUCTURA",
  "EDUCACIÓN Y FORMACIÓN",
  "ELABORACIÓN Y TRANSFORMACIÓN DE ALIMENTOS",
  "ELECTRÓNICA Y AUTOMATIZACIÓN",
  "EXPLORACIÓN Y EXTRACCIÓN DE MINAS, CANTERAS, PETRÓLEO Y GAS",
  "FABRICACIÓN, TRANSFORMACIÓN DE MATERIALES, INSTALACIÓN, MANTENIMIENTO Y REPARACIÓN",
  "INDUSTRIA QUÍMICA",
  "LITERATURA Y ARTES GRÁFICAS",
  "LOGÍSTICA Y TRANSPORTE",
  "PRODUCCIÓN DE ENERGÍA Y ELECTRICIDAD",
  "SALUD Y BIENESTAR",
  "SEGURIDAD",
  "SERVICIOS PERSONALES Y A LA COMUNIDAD",
  "TECNOLOGÍAS DE LA INFORMACIÓN Y LAS COMUNICACIONES",
  "TEXTIL, CUERO, CONFECCIÓN Y DISEÑO DE MODAS",
  "TRANSFORMACIÓN DE LA MADERA Y FABRICACIÓN DE MUEBLES",
  "TURISMO, HOTELERÍA Y GASTRONOMÍA",
  "DIPLOMADO",
  "TÉCNICO LABORAL",
  "CURSO CORTO",
  "BACHILLERATO"
];

async function run() {
  console.log("Inyectando categorías de programas...");
  for (const name of CATEGORIES) {
    const id = name.toLowerCase().replace(/ /g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    await setDoc(doc(db, col("academic_program_categories"), id), {
      id: id,
      name: name,
      isActive: true,
      createdAt: new Date().toISOString()
    });
    console.log(`✓ Inyectada: ${name}`);
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
