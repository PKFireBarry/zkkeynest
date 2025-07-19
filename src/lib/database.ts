import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { ApiKey, User, Share } from '@/types';
import { Folder } from '@/types';

// User operations
export async function createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
  const userRef = doc(db, 'users', userData.uid);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUser(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function updateUserMasterPassword(
  uid: string, 
  salt: string, 
  hash: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid,
      masterPasswordSalt: salt,
      masterPasswordHash: hash,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user master password:', error);
    throw error;
  }
}

export async function updateUserSessionTimeout(
  uid: string, 
  sessionTimeout: number
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      sessionTimeout,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user session timeout:', error);
    throw error;
  }
}

export async function updateUserStripeCustomerId(
  uid: string, 
  stripeCustomerId: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      stripeCustomerId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user Stripe customer ID:', error);
    throw error;
  }
}

export async function updateUserSubscription(
  uid: string, 
  subscription: 'free' | 'pro' | 'team'
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      subscription,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

// API Key operations
export async function createApiKey(apiKeyData: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const apiKeysRef = collection(db, 'apiKeys');
  const docRef = await addDoc(apiKeysRef, {
    ...apiKeyData,
    tags: apiKeyData.tags ?? [],
    category: apiKeyData.category ?? null,
    folderId: apiKeyData.folderId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getApiKeys(userId: string): Promise<ApiKey[]> {
  try {
    const apiKeysRef = collection(db, 'apiKeys');
    const q = query(
      apiKeysRef,
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const apiKeys: ApiKey[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      apiKeys.push({
        id: doc.id,
        ...data,
        tags: data.tags ?? [],
        category: data.category ?? null,
        folderId: data.folderId ?? null,
      } as ApiKey);
    });
    apiKeys.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    return apiKeys;
  } catch (error) {
    console.error('Error getting API keys:', error);
    throw error;
  }
}

export async function getApiKey(id: string): Promise<ApiKey | null> {
  const apiKeyRef = doc(db, 'apiKeys', id);
  const apiKeySnap = await getDoc(apiKeyRef);
  if (apiKeySnap.exists()) {
    const data = apiKeySnap.data();
    return {
      id: apiKeySnap.id,
      ...data,
      tags: data.tags ?? [],
      category: data.category ?? null,
      folderId: data.folderId ?? null,
    } as ApiKey;
  }
  return null;
}

export async function updateApiKey(
  id: string, 
  updates: Partial<Omit<ApiKey, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const apiKeyRef = doc(db, 'apiKeys', id);
  await updateDoc(apiKeyRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    tags: updates.tags ?? [],
    category: updates.category ?? null,
    folderId: updates.folderId ?? null,
  });
}

export async function updateApiKeyFolder(
  apiKeyId: string,
  folderId: string | null
): Promise<void> {
  const apiKeyRef = doc(db, 'apiKeys', apiKeyId);
  await updateDoc(apiKeyRef, {
    folderId: folderId,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteApiKey(id: string): Promise<void> {
  const apiKeyRef = doc(db, 'apiKeys', id);
  await deleteDoc(apiKeyRef);
}

// Folder CRUD operations
export async function createFolder(folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const foldersRef = collection(db, 'folders');
  const docRef = await addDoc(foldersRef, {
    ...folderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getFolders(userId: string): Promise<Folder[]> {
  const foldersRef = collection(db, 'folders');
  const q = query(foldersRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const folders: Folder[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    folders.push({
      id: doc.id,
      ...data,
    } as Folder);
  });
  folders.sort((a, b) => {
    const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });
  return folders;
}

export async function updateFolder(id: string, updates: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
  const folderRef = doc(db, 'folders', id);
  await updateDoc(folderRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFolder(id: string): Promise<void> {
  // First, find all API keys that are in this folder
  const apiKeysRef = collection(db, 'apiKeys');
  const q = query(apiKeysRef, where('folderId', '==', id));
  const querySnapshot = await getDocs(q);
  
  // Update all API keys to remove the folder reference
  const updatePromises = querySnapshot.docs.map(doc => 
    updateDoc(doc.ref, { 
      folderId: null,
      updatedAt: serverTimestamp()
    })
  );
  
  // Wait for all API keys to be updated
  await Promise.all(updatePromises);
  
  // Then delete the folder itself
  const folderRef = doc(db, 'folders', id);
  await deleteDoc(folderRef);
}

// Clear user data (for testing)
export async function clearUserData(uid: string): Promise<void> {
  try {
    // First, get all API keys for the user
    const apiKeysRef = collection(db, 'apiKeys');
    const apiKeysQuery = query(apiKeysRef, where('userId', '==', uid));
    const apiKeysSnapshot = await getDocs(apiKeysQuery);
    
    // Delete all API keys for the user
    const apiKeyDeletePromises = apiKeysSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(apiKeyDeletePromises);
    
    // Then, get all shares created by the user
    const sharesRef = collection(db, 'shares');
    const sharesQuery = query(sharesRef, where('createdBy', '==', uid));
    const sharesSnapshot = await getDocs(sharesQuery);
    
    // Delete all shares created by the user
    const shareDeletePromises = sharesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(shareDeletePromises);
    
    // Finally, delete the user document
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
}

// Utility functions
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

// Share operations
export async function createShare(shareData: Omit<Share, 'id' | 'createdAt'>): Promise<string> {
  try {
    const sharesRef = collection(db, 'shares');
    const docRef = await addDoc(sharesRef, {
      ...shareData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating share:', error);
    throw error;
  }
}

export async function getShare(shareId: string): Promise<Share | null> {
  try {
    const shareRef = doc(db, 'shares', shareId);
    const shareSnap = await getDoc(shareRef);
    
    if (shareSnap.exists()) {
      return {
        id: shareSnap.id,
        ...shareSnap.data()
      } as Share;
    }
    return null;
  } catch (error) {
    console.error('Error getting share:', error);
    throw error;
  }
}

export async function markShareAsUsed(shareId: string): Promise<void> {
  const shareRef = doc(db, 'shares', shareId);
  await updateDoc(shareRef, {
    used: true,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExpiredShares(): Promise<void> {
  try {
    const sharesRef = collection(db, 'shares');
    const now = serverTimestamp();
    const q = query(
      sharesRef,
      where('expiresAt', '<', now)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
  } catch (error) {
    console.error('Error deleting expired shares:', error);
    throw error;
  }
}

export async function getUserShares(userId: string): Promise<Share[]> {
  try {
    const sharesRef = collection(db, 'shares');
    const q = query(
      sharesRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const shares: Share[] = [];
    
    querySnapshot.forEach((doc) => {
      shares.push({
        id: doc.id,
        ...doc.data()
      } as Share);
    });
    
    return shares;
  } catch (error) {
    console.error('Error getting user shares:', error);
    throw error;
  }
} 