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
  console.log("🕵️ Conectando a Firebase para revisar profesores...");
  const snap = await getDocs(collection(db, "nuevaesperanza_teachers"));
  let count = 0;
  
  for (const item of snap.docs) {
    const data = item.data();
    const update = {};
    let changed = false;
    
    // CASO 1: Campos firstName y lastName
    if (data.firstName && data.lastName) {
      update.firstName = data.lastName;
      update.lastName = data.firstName;
      changed = true;
    }
    
    // CASO 2: Campos nombre y apellido
    if (data.nombre && data.apellido) {
      update.nombre = data.apellido;
      update.apellido = data.nombre;
      changed = true;
    }
    
    // CASO 3: Campos nombres y apellidos
    if (data.nombres && data.apellidos) {
      update.nombres = data.apellidos;
      update.apellidos = data.nombres;
      changed = true;
    }

    if (changed) {
      await updateDoc(doc(db, "nuevaesperanza_teachers", item.id), update);
      console.log(`✅ Actualizado: ${item.id} | Datos nuevos:`, update);
      count++;
    }
  }
  
  console.log(`🚀 Finalizado. Se corrigieron los nombres/apellidos de ${count} docentes.`);
  process.exit(0);
}

fix().catch(e => {
  console.error(e);
  process.exit(1);
});
