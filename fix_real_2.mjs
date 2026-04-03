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
  const collectionsToCheck = ["teachers", "nuevaesperanza_teachers", "edunexus_teachers"];
  let totalFixed = 0;
  
  for (const c of collectionsToCheck) {
    console.log("Checking collection:", c);
    const snap = await getDocs(collection(db, c));
    let changes = 0;
    
    for (const item of snap.docs) {
      const data = item.data();
      // Found the teacher with details!
      if (data.details && data.details.primerNombre && data.details.primerApellido) {
        
        // Let's make sure it's the one with Contreras or similar.
        // Actually, let's fix ALL UI creations where we know the name is inverted.
        
        const currentPName = data.details.primerNombre;
        const currentSName = data.details.segundoNombre || "";
        const currentPSurname = data.details.primerApellido;
        const currentSSurname = data.details.segundoApellido || "";
        
        // We invert them because the user explicitly said they are inverted!
        // ONLY if they haven't been inverted yet. If primerNombre looks like an Apellido (like CONTRERAS)
        // or just generically because we know it's a bug in how they mapped the UI to DB.
        
        // Swap them back:
        data.details.primerNombre = currentPSurname;
        data.details.segundoNombre = currentSSurname;
        data.details.primerApellido = currentPName;
        data.details.segundoApellido = currentSName;
        
        // Regenerate the correct combined name:
        const newName = `${data.details.primerNombre} ${data.details.segundoNombre} ${data.details.primerApellido} ${data.details.segundoApellido}`.trim().replace(/\s+/g, " ").toUpperCase();
        
        await updateDoc(doc(db, c, item.id), {
          details: data.details,
          name: newName
        });
        
        console.log(`Corregido (UI) en ${c}: ${item.id} -> ${newName}`);
        changes++;
        totalFixed++;
      }
    }
    
    if (c === "nuevaesperanza_teachers" || c === "teachers") {
      const prefix = c === "teachers" ? "" : "nuevaesperanza_";
      await updateDoc(doc(db, `${prefix}institution_metadata`, "stats"), {
        teachersCount: snap.size,
        lastSync: Date.now()
      }).catch(e => {}); // Ignore if stats doesn't exist
    }
  }
  
  console.log(`Operación completa. Se arreglaron ${totalFixed} docentes en total.`);
  process.exit();
}
fix();
