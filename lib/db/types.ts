export interface DBProvider {
  // Generic CRUD
  get<T>(collection: string, id: string, config?: any): Promise<T | null>;
  list<T>(collection: string, filters?: any, config?: any): Promise<T[]>;
  create(collection: string, data: any, config?: any): Promise<string>;
  update(collection: string, id: string, data: any, config?: any): Promise<void>;
  delete(collection: string, id: string, config?: any): Promise<void>;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface Institution {
  id: string;
  name: string;
  slug: string;
  type: 'RENTAL' | 'SALE';
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  firebaseConfig?: FirebaseConfig;
  masterCredentials?: {
    email: string;
    role: string;
  };
  createdAt: number;
}
