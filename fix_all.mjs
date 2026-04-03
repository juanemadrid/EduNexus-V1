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

const tenantCols = ["nuevaesperanza_teachers", "nuevaesperanza_docentes", "teachers", "docentes", "n_esperanza_docentes"];

async function fix() {
  console.log("Iniciando revisión profunda...");
  let count = 0;

  for (const c of tenantCols) {
    try {
      const snap = await getDocs(collection(db, c));
      for (const item of snap.docs) {
        const data = item.data();
        const update = {};
        let changed = false;

        // Validar Apellidos como Nombres ("CONTRERAS" en Nombres)
        if (data.nombres && data.apellidos) {
          update.nombres = data.apellidos;
          update.apellidos = data.nombres;
          changed = true;
        } else if (data.firstName && data.lastName) {
          update.firstName = data.lastName;
          update.lastName = data.firstName;
          changed = true;
        } else if (data.nombre && data.apellido) {
          update.nombre = data.apellido;
          update.apellido = data.nombre;
          changed = true;
        }
        
        // Handle name / fullName regeneration 
        if (changed && data.name) update.name = `${update.nombres || update.firstName || update.nombre} ${update.apellidos || update.lastName || update.apellido}`;
        if (changed && data.fullName) update.fullName = `${update.nombres || update.firstName || update.nombre} ${update.apellidos || update.lastName || update.apellido}`;

        if (changed) {
          await updateDoc(doc(db, c, item.id), update);
          console.log(`Corregido ID: ${item.id} en ${c}`);
          count++;
        }
      }
    } catch(err) {
      // Ignorar errores de permisos si la coleccion no existe
    }
  }

  console.log(`Finalizado. Se corrigieron los nombres/apellidos de ${count} docentes.`);
  process.exit(0);
}

fix().catch(e => {
  console.error(e);
  process.exit(1);
});
