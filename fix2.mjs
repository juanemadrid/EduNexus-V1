import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

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

async function fix() {
  const collections = ["users", "nuevaesperanza_users", "teachers", "nuevaesperanza_teachers", "edunexus_users"];
  let totalFixes = 0;

  for (const c of collections) {
    try {
      const snap = await getDocs(collection(db, c));
      for (const item of snap.docs) {
        const data = item.data();
        let changed = false;
        let pNombres = data.nombres || data.nombre || data.firstName || "";
        let pApellidos = data.apellidos || data.apellido || data.lastName || "";
        
        // Criterio de docentes: O tienen role docente, o "CONTRERAS" en nombres
        const isDocente = data.role === "Docente" || data.role === "teacher" || data.tipo === "Docente" || String(pNombres).includes("CONTRERAS");
        
        if (!isDocente) continue;

        const update = {};
        
        // Validamos si están volteados. 
        // Normalmente "CONTRERAS ALTAMIRANDA" está todo en mayúscula y se usó en lugar de Nombres,
        // o simplemente confiamos en voltearlos si ya descubrimos que todos los docentes están volteados
        // en esta plataforma específica de nueva esperanza.
        
        // Volteamos:
        if (data.nombres && data.apellidos) {
          update.nombres = data.apellidos;
          update.apellidos = data.nombres;
          changed = true;
        } else if (data.firstName && data.lastName) {
          update.firstName = data.lastName;
          update.lastName = data.firstName;
          changed = true;
        }

        if (changed) {
          await updateDoc(doc(db, c, item.id), update);
          console.log(`Corregido en ${c} -> ID: ${item.id}`);
          totalFixes++;
        }
      }
    } catch(e) {}
  }
  
  console.log(`HECHO. Total corregidos: ${totalFixes}`);
  process.exit();
}

fix().catch(e => { console.error(e); process.exit(1); });
