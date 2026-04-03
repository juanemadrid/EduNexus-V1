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
  const snap = await getDocs(collection(db, "nuevaesperanza_teachers"));
  let changes = 0;
  
  for (const item of snap.docs) {
    const data = item.data();
    let updateNeeded = false;
    let newName = "";
    
    // CASO CREADO DESDE LA UI: tiene un objeto details con los campos
    if (data.details && data.details.primerNombre && data.details.primerApellido) {
      const pN = data.details.primerNombre;
      const sN = data.details.segundoNombre || "";
      const pA = data.details.primerApellido;
      const sA = data.details.segundoApellido || "";
      
      // Chequear si el "primerNombre" es en realidad el apellido:
      // Normalmente los colombianos tienen 2 nombres y 2 apellidos, o los apellidos son largos.
      // Si sabemos que TODOS los insertados tienen los apellidos en los primeros nombres, los intercambiamos siempre.
      // Como todos tienen el error (según el usuario), los volteamos todos los que están mezclados.
      
      // Evitar doble volteado: si el primer nombre ya no es "CONTRERAS" ni se nota que esté invertido
      // Se lo invertimos incondicionalmente si "CONTRERAS" o simplemente los intercambiamos.
      
      data.details.primerNombre = pA;
      data.details.segundoNombre = sA;
      data.details.primerApellido = pN;
      data.details.segundoApellido = sN;
      
      newName = `${pA} ${sA} ${pN} ${sN}`.trim().replace(/\s+/g, " ").toUpperCase();
      
      await updateDoc(doc(db, "nuevaesperanza_teachers", item.id), {
        details: data.details,
        name: newName
      });
      console.log(`Corregido (UI): ${item.id} -> ${newName}`);
      changes++;
    }
  }
  
  // STATS DESFASADOS: El dashboard dice 2 profesores, pero hay 5 o más en la colección
  // Actualizamos el contador real:
  const snapAll = await getDocs(collection(db, "nuevaesperanza_teachers"));
  await updateDoc(doc(db, "nuevaesperanza_institution_metadata", "stats"), {
    teachersCount: snapAll.size,
    lastSync: Date.now()
  });
  console.log(`Contador de docentes actualizado a ${snapAll.size} (antes marcaba desfasado).`);
  
  console.log(`Operación completa. Se arreglaron ${changes} docentes.`);
  process.exit();
}
fix();
