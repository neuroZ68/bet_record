import { useState } from 'react'
import { auth } from '../lib/firebase'
import { createUserProfile, isUsernameTaken } from '../lib/userService'
import './Auth.css'

type UsernameSetupProps = {
  onComplete: () => void
}

export function UsernameSetup({ onComplete }: UsernameSetupProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmedUsername = username.trim()

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    setLoading(true)
    try {
      // Check if username is taken
      const taken = await isUsernameTaken(trimmedUsername)
      if (taken) {
        setError('Username is already taken')
        setLoading(false)
        return
      }

      const user = auth.currentUser
      if (!user) {
        setError('No user logged in')
        setLoading(false)
        return
      }

      // Create user profile
      await createUserProfile(user.uid, {
        email: user.email!,
        username: trimmedUsername,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        provider: 'google',
      })

      onComplete()
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="username-setup">
      <div className="username-card">
        <h2>Choose Your Username</h2>
        <p>Pick a unique username for your betting profile</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            pattern="[a-zA-Z0-9_]+"
            title="Username can only contain letters, numbers, and underscores"
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
