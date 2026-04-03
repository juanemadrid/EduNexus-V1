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
  DocumentData,
  enableIndexedDbPersistence,
  writeBatch,
  limit,
  startAfter,
  orderBy
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
    
    // Enable offline persistence in browser
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch((err) => {
          if (err.code === 'failed-precondition') {
              // Multiple tabs open, persistence can only be enabled
              // in one tab at a a time.
              console.warn("Firestore persistence failed: Multiple tabs open");
          } else if (err.code === 'unimplemented') {
              // The current browser does not support all of the
              // features required to enable persistence
              console.warn("Firestore persistence failed: Browser not supported");
          }
      });
    }

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

  async list<T>(collectionName: string, filters?: any, options?: { limit?: number, startAfterDoc?: any, orderByField?: string, cache?: boolean, forceRefresh?: boolean }, config?: FirebaseConfig): Promise<T[]> {
    const targetConfig = this.resolveConfig(config);
    
    // --- CACHING LOGIC ---
    const cacheKey = `edunexus_cache_${this.resolveCollectionName(collectionName)}`;
    if (options?.cache && !options?.forceRefresh && typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const TTL = 3600000; // 1 hour
          if (Date.now() - timestamp < TTL) {
            return data as T[];
          }
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }
    }

    const db = this.getDb(targetConfig);
    const resolvedCollection = this.resolveCollectionName(collectionName);
    const colRef = collection(db, resolvedCollection);
    
    let q = query(colRef);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== 'Todos') {
          q = query(q, where(key, '==', filters[key]));
        }
      });
    }

    if (options?.orderByField) {
      q = query(q, orderBy(options.orderByField));
    }

    if (options?.startAfterDoc) {
      q = query(q, startAfter(options.startAfterDoc));
    }

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(docSnap => ({ 
      _docId: docSnap.id, 
      id: docSnap.id, 
      ...docSnap.data() 
    } as T));

    // Store in cache if requested
    if (options?.cache && typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: results,
        timestamp: Date.now()
      }));
    }

    return results;
  }

  private clearCache(collectionName: string) {
    if (typeof window !== 'undefined') {
      const cacheKey = `edunexus_cache_${this.resolveCollectionName(collectionName)}`;
      localStorage.removeItem(cacheKey);
    }
  }

  async create(collectionName: string, data: any, config?: FirebaseConfig): Promise<string> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const resolvedCollection = this.resolveCollectionName(collectionName);
    let newId: string;
    if (data.id) {
      const docRef = doc(db, resolvedCollection, data.id);
      await setDoc(docRef, {
        ...data,
        createdAt: Date.now()
      });
      newId = data.id;
    } else {
      const colRef = collection(db, resolvedCollection);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: Date.now()
      });
      newId = docRef.id;
    }

    // --- AUTO-COUNTER LOGIC ---
    if (collectionName === 'students' || collectionName === 'teachers') {
      const statsRef = doc(db, this.resolveCollectionName('institution_metadata'), 'stats');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
          const currentStats = statsSnap.data();
          const key = collectionName === 'students' ? 'studentsCount' : 'teachersCount';
          await updateDoc(statsRef, {
              [key]: (currentStats[key] || 0) + 1,
              lastSync: Date.now()
          });
      }
    }

    this.clearCache(collectionName);
    return newId;
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
    this.clearCache(collectionName);
  }

  async delete(collectionName: string, id: string, config?: FirebaseConfig): Promise<void> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const resolvedCollection = this.resolveCollectionName(collectionName);
    const docRef = doc(db, resolvedCollection, id);
    await deleteDoc(docRef);

    // --- AUTO-COUNTER LOGIC ---
    if (collectionName === 'students' || collectionName === 'teachers') {
        const statsRef = doc(db, this.resolveCollectionName('institution_metadata'), 'stats');
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
            const currentStats = statsSnap.data();
            const key = collectionName === 'students' ? 'studentsCount' : 'teachersCount';
            await updateDoc(statsRef, {
                [key]: Math.max(0, (currentStats[key] || 0) - 1),
                lastSync: Date.now()
            });
        }
    }
    this.clearCache(collectionName);
  }

  async batchSave(collectionName: string, items: { id?: string, data: any }[], config?: FirebaseConfig): Promise<void> {
    const targetConfig = this.resolveConfig(config);
    const db = this.getDb(targetConfig);
    const resolvedCollection = this.resolveCollectionName(collectionName);
    const batch = writeBatch(db);

    items.forEach(item => {
      if (item.id) {
        const docRef = doc(db, resolvedCollection, item.id);
        batch.set(docRef, { ...item.data, updatedAt: Date.now() }, { merge: true });
      } else {
        const colRef = collection(db, resolvedCollection);
        const docRef = doc(colRef);
        batch.set(docRef, { ...item.data, createdAt: Date.now() });
      }
    });

    await batch.commit();
  }
}

export const firestoreProvider = new FirestoreProvider();
