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

  private getTenantContext() {
    if (typeof window !== 'undefined') {
      const userSaved = localStorage.getItem('edunexus_user');
      if (userSaved) {
        try {
          const user = JSON.parse(userSaved);
          if (user.role !== 'SUPER_ADMIN' && user.tenantId) {
             return { id: user.tenantId, type: user.tenantType || 'RENTAL' };
          }
        } catch (e) {
          console.error("Error parsing user context");
        }
      }
    }
    return null;
  }

  private resolveCollectionName(originalName: string): string {
    const globalCollections = ['tenants', 'packages', 'admin_logs'];
    if (globalCollections.includes(originalName)) return originalName;

    const tenant = this.getTenantContext();
    // Only prefix for RENTAL. SALE uses their own database so root collections are completely isolated.
    if (tenant && tenant.type === 'RENTAL') {
      return `${tenant.id}_${originalName}`;
    }
    return originalName;
  }

  async get<T>(collectionName: string, id: string, config?: FirebaseConfig): Promise<T | null> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const resolvedCollection = this.resolveCollectionName(collectionName);
    const docRef = doc(db, resolvedCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async list<T>(collectionName: string, filters?: any, config?: FirebaseConfig): Promise<T[]> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const resolvedCollection = this.resolveCollectionName(collectionName);
    const colRef = collection(db, resolvedCollection);
    
    let q = query(colRef);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          q = query(q, where(key, '==', filters[key]));
        }
      });
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ _docId: docSnap.id, id: docSnap.id, ...docSnap.data() } as T));
  }

  async create(collectionName: string, data: any, config?: FirebaseConfig): Promise<string> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const resolvedCollection = this.resolveCollectionName(collectionName);
    
    if (data.id) {
      const docRef = doc(db, resolvedCollection, data.id);
      await setDoc(docRef, {
        ...data,
        createdAt: Date.now()
      });
      return data.id;
    } else {
      const colRef = collection(db, resolvedCollection);
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
    const resolvedCollection = this.resolveCollectionName(collectionName);
    const docRef = doc(db, resolvedCollection, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now()
    });
  }

  async delete(collectionName: string, id: string, config?: FirebaseConfig): Promise<void> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const resolvedCollection = this.resolveCollectionName(collectionName);
    const docRef = doc(db, resolvedCollection, id);
    await deleteDoc(docRef);
  }
}

export const firestoreProvider = new FirestoreProvider();
