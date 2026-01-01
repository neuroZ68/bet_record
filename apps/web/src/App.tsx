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

import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, db, googleProvider } from './lib/firebase'

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

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [bets, setBets] = useState<BetDoc[]>([])
  const [sport, setSport] = useState('')
  const [league, setLeague] = useState('')
  const [event, setEvent] = useState('')
  const [pick, setPick] = useState('')
  const [oddsDecimal, setOddsDecimal] = useState('')
  const [stake, setStake] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null)
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

  async function handleGoogleLogin() {
    setError(null)
    await signInWithPopup(auth, googleProvider)
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

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>Bet Record</h1>
          <p className="sub">Prototype: track picks and outcomes.</p>
        </div>
        <div className="auth">
          {userId ? (
            <button onClick={handleLogout}>Log out</button>
          ) : (
            <button onClick={handleGoogleLogin}>Sign in with Google</button>
          )}
        </div>
      </header>

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
    </div>
  )
}

export default App
