import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  Firestore,
  addDoc,
  DocumentData
} from 'firebase/firestore';
import { DBProvider, FirebaseConfig } from '../types';
import { defaultFirebaseConfig } from '../defaultConfig';

export class FirestoreProvider implements DBProvider {
  private apps: Map<string, FirebaseApp> = new Map();
  private dbs: Map<string, Firestore> = new Map();

  private getDb(config: FirebaseConfig): Firestore {
    const appId = config.projectId;
    if (this.dbs.has(appId)) return this.dbs.get(appId)!;

    // Check if app already initialized
    const existingApp = getApps().find(a => a.name === appId);
    const app = existingApp || initializeApp(config, appId);
    
    const db = getFirestore(app);
    this.apps.set(appId, app);
    this.dbs.set(appId, db);
    return db;
  }

  private resolveConfig(config?: FirebaseConfig): FirebaseConfig {
    if (config) return config;
    
    // In browser, try to get from sessionStorage
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('edunexus_tenant_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing tenant config from session:", e);
        }
      }
    }
    
    return defaultFirebaseConfig;
  }

  async getInstitutionConfig(tenantId: string): Promise<any> {
    // This would typically come from a "Master" database
    // For now, we'll implement this in the SuperAdmin logic
    return null; 
  }

  async get<T>(collectionName: string, id: string, config?: FirebaseConfig): Promise<T | null> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async list<T>(collectionName: string, filters?: any, config?: FirebaseConfig): Promise<T[]> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const colRef = collection(db, collectionName);
    
    let q = query(colRef);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          q = query(q, where(key, '==', filters[key]));
        }
      });
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async create(collectionName: string, data: any, config?: FirebaseConfig): Promise<string> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    
    if (data.id) {
      const docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, {
        ...data,
        createdAt: Date.now()
      });
      return data.id;
    } else {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: Date.now()
      });
      return docRef.id;
    }
  }

  async update(collectionName: string, id: string, data: any, config?: FirebaseConfig): Promise<void> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now()
    });
  }

  async delete(collectionName: string, id: string, config?: FirebaseConfig): Promise<void> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  }
}

export const firestoreProvider = new FirestoreProvider();
