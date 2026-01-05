import { useState, useRef } from 'react'
import './MyBets.css'

type BetStatus = 'pending' | 'win' | 'loss' | 'push'

type MyBet = {
    id: string
    event: string
    sport: string
    pick: string
    odds: string
    stake: number
    status: BetStatus
    profit?: number
    isVerified: boolean
    date: string
}

type MyBetsProps = {
    userId: string | null
    onSignIn: () => void
}

// Mock user bets
const MOCK_USER_BETS: MyBet[] = [
    {
        id: '1',
        event: 'Lakers vs. Nuggets',
        sport: 'NBA',
        pick: 'Lakers ML',
        odds: '+150',
        stake: 50,
        status: 'win',
        profit: 75,
        isVerified: true,
        date: 'Oct 24, 2023',
    },
    {
        id: '2',
        event: 'Chiefs vs. Raiders',
        sport: 'NFL',
        pick: 'Chiefs -7.5',
        odds: '-110',
        stake: 110,
        status: 'loss',
        profit: -110,
        isVerified: true,
        date: 'Oct 22, 2023',
    },
    {
        id: '3',
        event: 'Warriors vs. Suns',
        sport: 'NBA',
        pick: 'Over 228.5',
        odds: '-105',
        stake: 100,
        status: 'pending',
        isVerified: false,
        date: 'Today',
    },
]

export function MyBets({ userId, onSignIn }: MyBetsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [ocrProgress, setOcrProgress] = useState(0)
    const [ocrComplete, setOcrComplete] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    // Form state with AI auto-fill simulation
    const [formData, setFormData] = useState({
        sportsbook: 'DraftKings',
        datePlaced: '',
        event: '',
        wagerAmount: '',
        odds: '',
        potentialPayout: '',
        betType: 'Moneyline',
    })
    const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set())

    // Stats calculation
    const stats = {
        total: MOCK_USER_BETS.length,
        wins: MOCK_USER_BETS.filter(b => b.status === 'win').length,
        losses: MOCK_USER_BETS.filter(b => b.status === 'loss').length,
        pending: MOCK_USER_BETS.filter(b => b.status === 'pending').length,
        profit: MOCK_USER_BETS.reduce((sum, b) => sum + (b.profit || 0), 0),
    }

    const handleFileSelect = (file: File) => {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        simulateOCR()
    }

    const simulateOCR = () => {
        setIsUploading(true)
        setOcrProgress(0)
        setOcrComplete(false)

        // Simulate OCR progress
        const interval = setInterval(() => {
            setOcrProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setIsUploading(false)
                    setOcrComplete(true)

                    // Simulate AI auto-fill
                    setFormData({
                        sportsbook: 'DraftKings',
                        datePlaced: '2023-10-24T19:30',
                        event: 'Lakers vs. Nuggets - NBA Opening Night',
                        wagerAmount: '50.00',
                        odds: '+150',
                        potentialPayout: '125.00',
                        betType: 'Moneyline',
                    })
                    setAiFilledFields(new Set(['event', 'wagerAmount', 'odds', 'potentialPayout']))

                    return 100
                }
                return prev + 10
            })
        }, 150)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In real app, would submit to Firestore
        alert('Bet submitted for verification!')
        setPreviewUrl(null)
        setOcrComplete(false)
        setFormData({
            sportsbook: 'DraftKings',
            datePlaced: '',
            event: '',
            wagerAmount: '',
            odds: '',
            potentialPayout: '',
            betType: 'Moneyline',
        })
        setAiFilledFields(new Set())
    }

    if (!userId) {
        return (
            <div className="my-bets-page">
                <div className="page-header">
                    <h1 className="page-title">My Bets</h1>
                    <p className="page-subtitle">Sign in to track your bets and build your verified record.</p>
                </div>
                <button
                    className="submit-btn"
                    style={{ marginTop: '1rem' }}
                    onClick={onSignIn}
                >
                    Sign In to Get Started
                </button>
            </div>
        )
    }

    return (
        <div className="my-bets-page">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Verify New Bet</h1>
                <p className="page-subtitle">
                    Upload a screenshot of your bet slip. Our AI will auto-fill the details for maximum transparency and verifiable proof.
                </p>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
                <div className="stats-grid">
                    <div className="stat-box">
                        <div className="label">Total Bets</div>
                        <div className="value">{stats.total}</div>
                    </div>
                    <div className="stat-box">
                        <div className="label">Wins</div>
                        <div className="value positive">{stats.wins}</div>
                    </div>
                    <div className="stat-box">
                        <div className="label">Losses</div>
                        <div className="value negative">{stats.losses}</div>
                    </div>
                    <div className="stat-box">
                        <div className="label">Pending</div>
                        <div className="value">{stats.pending}</div>
                    </div>
                    <div className="stat-box">
                        <div className="label">Net Profit</div>
                        <div className={`value ${stats.profit >= 0 ? 'positive' : 'negative'}`}>
                            {stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Zone */}
            {!previewUrl ? (
                <div
                    className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="upload-icon-wrapper">
                        <span className="upload-icon">☁️</span>
                    </div>
                    <div className="upload-text">
                        <h3>Drag & drop screenshot here</h3>
                        <p>or click to browse files. Supports JPG, PNG.</p>
                    </div>
                    <button className="upload-btn" type="button">
                        Select File
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                </div>
            ) : (
                <div className="preview-container">
                    <img src={previewUrl} alt="Bet slip preview" className="preview-image" />
                    <button
                        className="remove-preview"
                        onClick={() => {
                            setPreviewUrl(null)
                            setOcrComplete(false)
                            setOcrProgress(0)
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* OCR Progress */}
            {(isUploading || ocrComplete) && (
                <div className="ocr-progress">
                    <div className="ocr-header">
                        <div className="ocr-status">
                            <span className="ocr-icon">🔍</span>
                            <span className="ocr-text">
                                {ocrComplete ? 'Scan Complete' : 'Scanning Receipt...'}
                            </span>
                        </div>
                        <span className="ocr-percent">{ocrProgress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${ocrProgress}%` }} />
                    </div>
                    {ocrComplete && (
                        <div className="ocr-success">
                            ✓ Data extracted successfully
                        </div>
                    )}
                </div>
            )}

            {/* Form Section */}
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <div className="form-header">
                        <h3 className="form-title">Bet Details</h3>
                        {aiFilledFields.size > 0 && (
                            <div className="ai-badge">
                                <span className="ai-icon">✨</span>
                                AI Auto-filled
                            </div>
                        )}
                    </div>

                    <div className="form-grid">
                        {/* Sportsbook */}
                        <div className="form-group">
                            <label className="form-label">Sportsbook</label>
                            <div className="form-input-wrapper">
                                <select
                                    className="form-select"
                                    value={formData.sportsbook}
                                    onChange={(e) => setFormData({ ...formData, sportsbook: e.target.value })}
                                >
                                    <option>DraftKings</option>
                                    <option>FanDuel</option>
                                    <option>BetMGM</option>
                                    <option>Caesars</option>
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                        </div>

                        {/* Date Placed */}
                        <div className="form-group">
                            <label className="form-label">Date Placed</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={formData.datePlaced}
                                    onChange={(e) => setFormData({ ...formData, datePlaced: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Event */}
                        <div className="form-group full-width">
                            <label className="form-label">Event / Matchup</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    className={`form-input ${aiFilledFields.has('event') ? 'ai-filled' : ''}`}
                                    placeholder="Lakers vs. Celtics"
                                    value={formData.event}
                                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                                />
                                {aiFilledFields.has('event') && <span className="ai-indicator">✨</span>}
                            </div>
                        </div>

                        {/* Wager Amount */}
                        <div className="form-group">
                            <label className="form-label">Wager Amount</label>
                            <div className="form-input-wrapper">
                                <span className="currency-prefix">$</span>
                                <input
                                    type="number"
                                    className={`form-input with-prefix ${aiFilledFields.has('wagerAmount') ? 'ai-filled' : ''}`}
                                    placeholder="50.00"
                                    value={formData.wagerAmount}
                                    onChange={(e) => setFormData({ ...formData, wagerAmount: e.target.value })}
                                />
                                {aiFilledFields.has('wagerAmount') && <span className="ai-indicator">✨</span>}
                            </div>
                        </div>

                        {/* Odds */}
                        <div className="form-group">
                            <label className="form-label">Odds</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    className={`form-input ${aiFilledFields.has('odds') ? 'ai-filled' : ''}`}
                                    placeholder="+150 or -110"
                                    value={formData.odds}
                                    onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                                />
                                {aiFilledFields.has('odds') && <span className="ai-indicator">✨</span>}
                            </div>
                        </div>

                        {/* Potential Payout */}
                        <div className="form-group">
                            <label className="form-label">Potential Payout</label>
                            <div className="form-input-wrapper">
                                <span className="currency-prefix">$</span>
                                <input
                                    type="number"
                                    className={`form-input with-prefix ${aiFilledFields.has('potentialPayout') ? 'ai-filled' : ''}`}
                                    placeholder="125.00"
                                    value={formData.potentialPayout}
                                    onChange={(e) => setFormData({ ...formData, potentialPayout: e.target.value })}
                                />
                                {aiFilledFields.has('potentialPayout') && <span className="ai-indicator">✨</span>}
                            </div>
                        </div>

                        {/* Bet Type */}
                        <div className="form-group">
                            <label className="form-label">Bet Type</label>
                            <div className="form-input-wrapper">
                                <select
                                    className="form-select"
                                    value={formData.betType}
                                    onChange={(e) => setFormData({ ...formData, betType: e.target.value })}
                                >
                                    <option>Moneyline</option>
                                    <option>Spread</option>
                                    <option>Over/Under</option>
                                    <option>Parlay</option>
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="action-bar">
                    <button type="button" className="cancel-btn">Cancel</button>
                    <button type="submit" className="submit-btn">
                        ✓ Verify & Publish
                    </button>
                </div>
            </form>

            {/* My Bet History */}
            <div className="my-bets-history">
                <div className="history-header">
                    <h3>Your Bet History</h3>
                    <div className="filter-buttons">
                        <button className="filter-btn active">All</button>
                        <button className="filter-btn">Verified</button>
                        <button className="filter-btn">Pending</button>
                    </div>
                </div>

                <div className="bet-list">
                    {MOCK_USER_BETS.map((bet) => (
                        <div key={bet.id} className={`bet-item ${bet.status}`}>
                            <div className="bet-main">
                                <div
                                    className="bet-sport-icon"
                                    style={{
                                        backgroundImage: `url(https://api.dicebear.com/7.x/shapes/svg?seed=${bet.sport})`
                                    }}
                                />
                                <div className="bet-info">
                                    <div className="bet-event">
                                        <h4>{bet.event}</h4>
                                        <span>•</span>
                                        <span>{bet.sport} • {bet.date}</span>
                                    </div>
                                    <div className="bet-details">
                                        <span className="bet-pick">{bet.pick}</span>
                                        <span className="bet-odds">@ {bet.odds}</span>
                                        <span className="bet-stake">Stake: <span>${bet.stake}</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="bet-result">
                                {bet.isVerified ? (
                                    <div className="ocr-badge">
                                        <span>✓ Verified</span>
                                    </div>
                                ) : (
                                    <div className="unverified-badge">
                                        <span>⏳ Pending</span>
                                    </div>
                                )}

                                <div className="outcome">
                                    <span className={`outcome-status ${bet.status}`}>
                                        {bet.status.toUpperCase()}
                                    </span>
                                    {bet.profit !== undefined && (
                                        <span className={`outcome-amount ${bet.status}`}>
                                            {bet.profit >= 0 ? '+' : ''}${bet.profit.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
