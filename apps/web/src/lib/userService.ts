import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import type { UserDoc } from '../types/user'

export async function createUserProfile(
  userId: string,
  data: {
    email: string
    username: string
    displayName?: string
    photoURL?: string
    provider: 'google' | 'email'
  }
) {
  const userRef = doc(db, 'users', userId)
  const userData: any = {
    email: data.email,
    username: data.username,
    provider: data.provider,
    createdAt: serverTimestamp(),
  }
  // Only add optional fields if they have values
  if (data.displayName) {
    userData.displayName = data.displayName
  }
  if (data.photoURL) {
    userData.photoURL = data.photoURL
  }
  await setDoc(userRef, userData)
  return userData
}

export async function getUserProfile(userId: string) {
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() as UserDoc : null
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('username', '==', username))
  const snapshot = await getDocs(q)
  return !snapshot.empty
}
