export type UserProfile = {
  id: string
  email: string
  username: string
  displayName?: string
  photoURL?: string
  createdAt: Date
  provider: 'google' | 'email'
}

export type UserDoc = {
  email: string
  username: string
  displayName?: string
  photoURL?: string
  createdAt: unknown
  provider: 'google' | 'email'
}
