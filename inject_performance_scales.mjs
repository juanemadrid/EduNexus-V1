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
  console.log("Inyectando escalas de desempeño reales (Decreto 1290)...");

  const scales = [
    { 
        id: 'scale_superior', 
        nivelDesempeno: 'Superior', 
        notaMinima: '4.6', 
        notaMaxima: '5.0', 
        reglaConceptual: 'El estudiante supera ampliamente los logros y objetivos académicos previstos, demostrando un liderazgo y compromiso excepcional con su proceso de aprendizaje.', 
        estado: 'Activo' 
    },
    { 
        id: 'scale_alto', 
        nivelDesempeno: 'Alto', 
        notaMinima: '4.0', 
        notaMaxima: '4.5', 
        reglaConceptual: 'El estudiante alcanza satisfactoriamente los logros y objetivos propuestos, evidenciando un buen dominio de las competencias y cumplimiento de sus deberes.', 
        estado: 'Activo' 
    },
    { 
        id: 'scale_basico', 
        nivelDesempeno: 'Básico', 
        notaMinima: '3.0', 
        notaMaxima: '3.9', 
        reglaConceptual: 'El estudiante alcanza los logros y objetivos mínimos necesarios para el grado, requiriendo en ocasiones refuerzos para consolidar sus competencias.', 
        estado: 'Activo' 
    },
    { 
        id: 'scale_bajo', 
        nivelDesempeno: 'Bajo', 
        notaMinima: '1.0', 
        notaMaxima: '2.9', 
        reglaConceptual: 'El estudiante no alcanza los logros y objetivos previstos para el periodo, presentando dificultades significativas que requieren planes de mejoramiento urgentes.', 
        estado: 'Activo' 
    }
  ];

  for (const scale of scales) {
    await setDoc(doc(db, col("eval_parameters"), scale.id), {
        ...scale,
        createdAt: new Date().toISOString()
    });
    console.log(`✓ Escala Inyectada: ${scale.nivelDesempeno} (${scale.notaMinima}-${scale.notaMaxima})`);
  }

  console.log("¡Inyección de escalas de desempeño completada!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
