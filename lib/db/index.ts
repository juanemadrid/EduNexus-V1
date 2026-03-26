import { firestoreProvider } from './providers/firestore';
import { DBProvider } from './types';

// In a real app, this could be configurable to support multiple providers
// For now, based on the user's decision, we are using Firestore for everything.
export const db: DBProvider = firestoreProvider;

export * from './types';
