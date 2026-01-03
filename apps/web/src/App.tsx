import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from './lib/firebase'
import { getUserProfile } from './lib/userService'
import { Auth } from './components/Auth'
import { UsernameSetup } from './components/UsernameSetup'
import type { UserDoc } from './types/user'

type BetStatus = 'pending' | 'win' | 'loss' | 'push'

type BetDoc = {
  id: string
  userId: string
  createdAt: unknown
  sport: string
  league: string
  event: string
  pick: string
  oddsDecimal: number
  stake: number
  status: BetStatus
  settledAt?: unknown | null
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function profitFor(bet: Pick<BetDoc, 'status' | 'stake' | 'oddsDecimal'>) {
  if (bet.status === 'win') return bet.stake * (bet.oddsDecimal - 1)
  if (bet.status === 'loss') return -bet.stake
  return 0
}

type RankedUser = {
  id: string
  username: string
  settledBets: number
  winStreak: number
  winRate: number
  roi: number
  netProfit: number
}

// Simulated rankings data
const SIMULATED_RANKINGS: RankedUser[] = [
  {
    id: '1',
    username: 'SharpBettor2024',
    settledBets: 127,
    winStreak: 8,
    winRate: 58.3,
    roi: 12.4,
    netProfit: 3847.50,
  },
  {
    id: '2',
    username: 'MLBKing',
    settledBets: 89,
    winStreak: 5,
    winRate: 56.2,
    roi: 9.8,
    netProfit: 2156.75,
  },
  {
    id: '3',
    username: 'NBAWizard',
    settledBets: 203,
    winStreak: 3,
    winRate: 54.1,
    roi: 7.3,
    netProfit: 4521.20,
  },
  {
    id: '4',
    username: 'UnderdogHunter',
    settledBets: 156,
    winStreak: 12,
    winRate: 52.8,
    roi: 15.6,
    netProfit: 6842.30,
  },
  {
    id: '5',
    username: 'ValueSeeker',
    settledBets: 94,
    winStreak: 2,
    winRate: 51.5,
    roi: 6.2,
    netProfit: 1234.80,
  },
  {
    id: '6',
    username: 'ParleyPro',
    settledBets: 67,
    winStreak: 1,
    winRate: 49.3,
    roi: -2.1,
    netProfit: -567.40,
  },
  {
    id: '7',
    username: 'NFLAnalyst',
    settledBets: 178,
    winStreak: 0,
    winRate: 48.9,
    roi: -1.8,
    netProfit: -892.15,
  },
  {
    id: '8',
    username: 'SoccerFanatic',
    settledBets: 112,
    winStreak: 4,
    winRate: 55.4,
    roi: 8.9,
    netProfit: 2987.60,
  },
  {
    id: '9',
    username: 'HockeyBets',
    settledBets: 45,
    winStreak: 0,
    winRate: 46.7,
    roi: -5.3,
    netProfit: -1243.50,
  },
  {
    id: '10',
    username: 'TennisTracker',
    settledBets: 83,
    winStreak: 6,
    winRate: 53.0,
    roi: 4.5,
    netProfit: 982.25,
  },
]

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserDoc | null>(null)
  const [needsUsername, setNeedsUsername] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [bets, setBets] = useState<BetDoc[]>([])
  const [activeTab, setActiveTab] = useState<'bets' | 'rankings'>('bets')
  const [sport, setSport] = useState('')
  const [league, setLeague] = useState('')
  const [event, setEvent] = useState('')
  const [pick, setPick] = useState('')
  const [oddsDecimal, setOddsDecimal] = useState('')
  const [stake, setStake] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserId(null)
        setUserProfile(null)
        setNeedsUsername(false)
        setAuthLoading(false)
        return
      }

      setUserId(user.uid)
      
      // Check if user has a profile
      const profile = await getUserProfile(user.uid)
      
      if (!profile) {
        // User authenticated but no profile - needs username
        setNeedsUsername(true)
        setUserProfile(null)
      } else {
        setUserProfile(profile)
        setNeedsUsername(false)
      }
      
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!userId) {
      setBets([])
      return
    }

    const betsRef = collection(db, 'bets')
    const q = query(betsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: BetDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BetDoc, 'id'>),
        }))
        setBets(next)
      },
      (e) => setError(e.message),
    )
    return () => unsub()
  }, [userId])

  const stats = useMemo(() => {
    const settled = bets.filter((b) => b.status !== 'pending')
    const wins = settled.filter((b) => b.status === 'win').length
    const losses = settled.filter((b) => b.status === 'loss').length
    const pushes = settled.filter((b) => b.status === 'push').length
    const staked = settled.reduce((sum, b) => sum + (Number(b.stake) || 0), 0)
    const net = settled.reduce((sum, b) => sum + profitFor(b), 0)
    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0
    const roi = staked > 0 ? (net / staked) * 100 : 0
    return {
      settledCount: settled.length,
      wins,
      losses,
      pushes,
      staked: round2(staked),
      net: round2(net),
      winRate: round2(winRate),
      roi: round2(roi),
    }
  }, [bets])

  async function handleUsernameComplete() {
    // Reload user profile
    if (userId) {
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
      setNeedsUsername(false)
    }
  }

  async function handleAuthComplete() {
    // Close modal and auth state will be handled by onAuthStateChanged
    setShowAuthModal(false)
  }

  async function handleLogout() {
    setError(null)
    await signOut(auth)
  }

  async function handleCreateBet(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setError(null)
    const odds = Number(oddsDecimal)
    const s = Number(stake)

    if (!sport.trim() || !pick.trim() || !event.trim()) {
      setError('Sport, event, and pick are required.')
      return
    }
    if (!Number.isFinite(odds) || odds <= 1) {
      setError('Odds (decimal) must be a number > 1 (e.g. 1.91).')
      return
    }
    if (!Number.isFinite(s) || s <= 0) {
      setError('Stake must be a number > 0.')
      return
    }

    setSaving(true)
    try {
      await addDoc(collection(db, 'bets'), {
        userId,
        createdAt: serverTimestamp(),
        sport: sport.trim(),
        league: league.trim(),
        event: event.trim(),
        pick: pick.trim(),
        oddsDecimal: odds,
        stake: s,
        status: 'pending' as BetStatus,
        settledAt: null,
      })
      setSport('')
      setLeague('')
      setEvent('')
      setPick('')
      setOddsDecimal('')
      setStake('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create bet')
    } finally {
      setSaving(false)
    }
  }

  async function handleSettle(betId: string, status: BetStatus) {
    setError(null)
    try {
      await updateDoc(doc(db, 'bets', betId), {
        status,
        settledAt: status === 'pending' ? null : serverTimestamp(),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update bet')
    }
  }

  async function handleDelete(betId: string) {
    setError(null)
    try {
      await deleteDoc(doc(db, 'bets', betId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete bet')
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return <div className="loading">Loading...</div>
  }

  // Show username setup for users who just signed in with Google
  if (needsUsername) {
    return <UsernameSetup onComplete={handleUsernameComplete} />
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo-section">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 20L35 40L45 45L40 60L55 50L45 45L50 20Z" stroke="#10b981" strokeWidth="3" fill="none"/>
            <path d="M30 50C30 50 35 45 40 50C45 55 50 60 50 60" stroke="#10b981" strokeWidth="3" fill="none"/>
            <path d="M70 50C70 50 65 45 60 50C55 55 50 60 50 60" stroke="#10b981" strokeWidth="3" fill="none"/>
            <path d="M45 70L50 75L55 70L50 85L45 70Z" fill="#10b981"/>
            <rect x="42" y="75" width="4" height="5" fill="#10b981"/>
            <rect x="46" y="75" width="4" height="5" fill="#10b981"/>
            <rect x="50" y="75" width="4" height="5" fill="#10b981"/>
            <rect x="54" y="75" width="4" height="5" fill="#10b981"/>
          </svg>
          <div className="brand-text">
            <h1>BetTrack <span className="pro">Pro</span></h1>
            <p className="sub">{userProfile ? `Welcome, ${userProfile.username}!` : 'Track your bets like a pro'}</p>
          </div>
        </div>
        <div className="auth">
          {userId && userProfile ? (
            <button onClick={handleLogout}>Log out</button>
          ) : (
            <button onClick={() => setShowAuthModal(true)}>Sign In</button>
          )}
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'bets' ? 'active' : ''}`}
          onClick={() => setActiveTab('bets')}
        >
          My Bets
        </button>
        <button
          className={`tab ${activeTab === 'rankings' ? 'active' : ''}`}
          onClick={() => setActiveTab('rankings')}
        >
          Rankings
        </button>
      </nav>

      {showAuthModal && !userId && (
        <div className="auth-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAuthModal(false)
        }}>
          <Auth onAuthComplete={handleAuthComplete} />
        </div>
      )}

      {activeTab === 'bets' ? (
        <main className="grid">
          <section className="card">
            <h2>New bet</h2>
            {!userId ? (
              <p>Sign in (top-right) to post bets and track your record.</p>
            ) : null}
            <form onSubmit={handleCreateBet} className="form">
              <label>
                Sport
                <input
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  placeholder="NBA"
                  disabled={!userId}
                />
              </label>
              <label>
                League (optional)
                <input
                  value={league}
                  onChange={(e) => setLeague(e.target.value)}
                  placeholder="NBA"
                  disabled={!userId}
                />
              </label>
              <label>
                Event
                <input
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  placeholder="Lakers vs Celtics"
                  disabled={!userId}
                />
              </label>
              <label>
                Pick
                <input
                  value={pick}
                  onChange={(e) => setPick(e.target.value)}
                  placeholder="Lakers ML"
                  disabled={!userId}
                />
              </label>
              <label>
                Odds (decimal)
                <input
                  value={oddsDecimal}
                  onChange={(e) => setOddsDecimal(e.target.value)}
                  placeholder="1.91"
                  disabled={!userId}
                />
              </label>
              <label>
                Stake
                <input
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="100"
                  disabled={!userId}
                />
              </label>
              <button type="submit" disabled={!userId || saving}>
                {saving ? 'Saving…' : 'Post bet'}
              </button>
            </form>
            {error ? <p className="error">{error}</p> : null}
          </section>

          <section className="card">
            <h2>Analytics</h2>
            {!userId ? <p>Sign in to see your analytics.</p> : null}
            <div className="stats">
              <div>
                <div className="k">Settled</div>
                <div className="v">{stats.settledCount}</div>
              </div>
              <div>
                <div className="k">W-L-P</div>
                <div className="v">
                  {stats.wins}-{stats.losses}-{stats.pushes}
                </div>
              </div>
              <div>
                <div className="k">Win %</div>
                <div className="v">{stats.winRate}%</div>
              </div>
              <div>
                <div className="k">Net</div>
                <div className="v">{stats.net}</div>
              </div>
              <div>
                <div className="k">ROI</div>
                <div className="v">{stats.roi}%</div>
              </div>
            </div>
          </section>

          <section className="card full">
            <h2>Your bets</h2>
            {!userId ? (
              <p>Sign in to create and view your bets.</p>
            ) : bets.length === 0 ? (
              <p>No bets yet.</p>
            ) : (
              <div className="list">
                {bets.map((b) => (
                  <div key={b.id} className="row">
                    <div className="rowMain">
                      <div className="rowTitle">
                        <strong>{b.sport}</strong> — {b.event}
                      </div>
                      <div className="rowSub">
                        {b.pick} · odds {b.oddsDecimal} · stake {b.stake} ·{' '}
                        <span className={`pill ${b.status}`}>{b.status}</span>
                      </div>
                    </div>
                    <div className="rowActions">
                      <button onClick={() => handleSettle(b.id, 'win')}>Win</button>
                      <button onClick={() => handleSettle(b.id, 'loss')}>Loss</button>
                      <button onClick={() => handleSettle(b.id, 'push')}>Push</button>
                      <button onClick={() => handleSettle(b.id, 'pending')}>Pending</button>
                      <button onClick={() => handleDelete(b.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="rankings-container">
          <section className="card">
            <h2>Community Rankings</h2>
            <p className="sub">Top bettors ranked by performance</p>

            <div className="rankings-table">
              <div className="rankings-header">
                <div className="rank-col">#</div>
                <div className="user-col">User</div>
                <div className="stat-col">Bets</div>
                <div className="stat-col">Streak</div>
                <div className="stat-col">Win %</div>
                <div className="stat-col">ROI %</div>
                <div className="stat-col">Net Profit</div>
              </div>
              {SIMULATED_RANKINGS.map((user, index) => (
                <div key={user.id} className="ranking-row">
                  <div className="rank-col">
                    <span className={`rank-badge ${index < 3 ? `top${index + 1}` : ''}`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="user-col">
                    <strong>{user.username}</strong>
                  </div>
                  <div className="stat-col">{user.settledBets}</div>
                  <div className="stat-col">
                    <span className={user.winStreak > 0 ? 'positive' : ''}>
                      {user.winStreak > 0 ? `🔥 ${user.winStreak}` : '-'}
                    </span>
                  </div>
                  <div className="stat-col">{user.winRate}%</div>
                  <div className="stat-col">
                    <span className={user.roi >= 0 ? 'positive' : 'negative'}>
                      {user.roi >= 0 ? '+' : ''}
                      {user.roi}%
                    </span>
                  </div>
                  <div className="stat-col">
                    <span className={user.netProfit >= 0 ? 'positive' : 'negative'}>
                      {user.netProfit >= 0 ? '+' : ''}${user.netProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
