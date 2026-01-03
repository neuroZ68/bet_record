import { useState } from 'react'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { createUserProfile, getUserProfile, isUsernameTaken } from '../lib/userService'
import './Auth.css'

type AuthProps = {
  onAuthComplete: () => void
}

export function Auth({ onAuthComplete }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const logo = (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8 L20 20 L28 32" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 20 Q15 15 20 14 Q25 15 28 20" stroke="#10b981" strokeWidth="2" fill="none"/>
      <path d="M8 22 Q12 18 20 20" stroke="#10b981" strokeWidth="1.5" fill="none"/>
      <path d="M32 22 Q28 18 20 20" stroke="#10b981" strokeWidth="1.5" fill="none"/>
      <circle cx="20" cy="12" r="2" fill="#10b981"/>
      <rect x="22" y="28" width="2" height="6" fill="#10b981"/>
      <rect x="26" y="24" width="2" height="10" fill="#10b981"/>
      <rect x="30" y="20" width="2" height="14" fill="#10b981"/>
    </svg>
  )

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user profile exists
      const profile = await getUserProfile(user.uid)
      
      if (!profile) {
        // New Google user - need to set username
        // Will be handled by UsernameSetup component
        return
      }

      onAuthComplete()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (isSignUp && !username.trim()) {
      setError('Username is required')
      return
    }

    if (isSignUp && username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        // Check if username is taken
        const taken = await isUsernameTaken(username.trim())
        if (taken) {
          setError('Username is already taken')
          setLoading(false)
          return
        }

        // Create account
        const result = await createUserWithEmailAndPassword(auth, email, password)
        
        // Create user profile
        await createUserProfile(result.user.uid, {
          email: result.user.email!,
          username: username.trim(),
          provider: 'email',
        })

        onAuthComplete()
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password)
        onAuthComplete()
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else {
        setError(err.message || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          {logo}
          <h1>BetTrack <span className="pro">Pro</span></h1>
        </div>
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

        <button 
          className="google-btn" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleEmailAuth}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="toggle-auth">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            type="button" 
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            disabled={loading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
