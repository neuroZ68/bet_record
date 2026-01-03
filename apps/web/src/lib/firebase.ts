import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const isDev = import.meta.env.DEV

function getEnv(name: string) {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function envOrDevDefault(name: string, devDefault: string) {
  const value = getEnv(name)
  if (value) return value
  if (isDev) return devDefault
  throw new Error(`Missing required env var: ${name}`)
}

const projectId = envOrDevDefault('VITE_FIREBASE_PROJECT_ID', 'demo-bet-record')

const firebaseConfig = {
  apiKey: envOrDevDefault('VITE_FIREBASE_API_KEY', 'demo-api-key'),
  authDomain: envOrDevDefault('VITE_FIREBASE_AUTH_DOMAIN', `${projectId}.firebaseapp.com`),
  projectId,
  storageBucket: envOrDevDefault('VITE_FIREBASE_STORAGE_BUCKET', `${projectId}.appspot.com`),
  messagingSenderId: envOrDevDefault('VITE_FIREBASE_MESSAGING_SENDER_ID', '000000000000'),
  appId: envOrDevDefault('VITE_FIREBASE_APP_ID', '1:000000000000:web:demo'),
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

const useEmulators = isDev && getEnv('VITE_USE_EMULATORS') === 'true'
if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
