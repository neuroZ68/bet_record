import './InfluencerProfile.css'

type InfluencerProfileProps = {
    profileId: string
    onBack: () => void
}

// Mock profile data
const MOCK_PROFILE = {
    id: 'apex-picks',
    username: 'ApexPicks_Official',
    bio: 'Professional Sports Bettor | NBA & NFL Expert',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Apex',
    isVerified: true,
    isPro: true,
    country: '🇺🇸 USA',
    badge: 'Top 1% ROI',
    stats: {
        totalProfit: '+$12,450',
        profitTrend: '+2.1% this week',
        roi: '14.2%',
        roiPeriod: 'All Time',
        winRate: '58%',
        winRatePeriod: 'Last 100 Bets',
    },
    transparencyScore: 98,
    totalBets: 142,
}

// Mock bet history
const MOCK_BETS = [
    {
        id: '1',
        event: 'Raptors vs. Celtics',
        sport: 'NBA',
        date: 'Oct 26, 2023 • 7:30 PM EST',
        pick: 'Raptors +6.5',
        odds: '-110',
        stake: '$500',
        isVerified: true,
        status: 'win' as const,
        profit: '+$454.55',
    },
    {
        id: '2',
        event: 'Chiefs vs. Broncos',
        sport: 'NFL',
        date: 'Oct 24, 2023 • 8:15 PM EST',
        pick: 'Chiefs -10.5',
        odds: '-105',
        stake: '$1,000',
        isVerified: true,
        status: 'loss' as const,
        profit: '-$1,000.00',
    },
    {
        id: '3',
        event: 'Makhachev vs. Volkanovski 2',
        sport: 'UFC',
        date: 'Oct 21, 2023',
        pick: 'Makhachev ML',
        odds: '-250',
        stake: '$2,500',
        isVerified: false,
        status: 'pending' as const,
        profit: 'Oct 21',
    },
]

export function InfluencerProfile({ onBack }: InfluencerProfileProps) {
    const profile = MOCK_PROFILE
    const bets = MOCK_BETS

    return (
        <div className="profile-page">
            {/* Back Button */}
            <button className="back-btn" onClick={onBack}>
                ← Back to Feed
            </button>

            {/* Profile Header Card */}
            <div className="profile-card">
                <div className="profile-cover" />

                <div className="profile-content">
                    {/* Left: Identity */}
                    <div className="profile-identity">
                        <div className="avatar-container">
                            <div
                                className="profile-avatar"
                                style={{ backgroundImage: `url(${profile.avatar})` }}
                            />
                            {profile.isVerified && (
                                <div className="verified-badge-large">✓</div>
                            )}
                        </div>

                        <h1 className="profile-name">
                            {profile.username}
                            {profile.isPro && <span className="pro-badge">PRO</span>}
                        </h1>
                        <p className="profile-bio">{profile.bio}</p>

                        <div className="profile-tags">
                            <span className="tag">{profile.country}</span>
                            <span className="tag">{profile.badge}</span>
                        </div>

                        <div className="profile-actions">
                            <button className="follow-btn">Follow</button>
                            <button className="subscribe-btn">Subscribe ($29)</button>
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="profile-stats">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-header">
                                    <span className="stat-label">Total Profit</span>
                                    <span className="stat-icon">💰</span>
                                </div>
                                <span className="stat-value">{profile.stats.totalProfit}</span>
                                <span className="stat-trend">📈 {profile.stats.profitTrend}</span>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <span className="stat-label">ROI</span>
                                    <span className="stat-icon">📊</span>
                                </div>
                                <span className="stat-value">{profile.stats.roi}</span>
                                <span className="stat-trend">⬆️ {profile.stats.roiPeriod}</span>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <span className="stat-label">Win Rate</span>
                                    <span className="stat-icon">🏆</span>
                                </div>
                                <span className="stat-value">{profile.stats.winRate}</span>
                                <span className="stat-trend" style={{ color: '#9db9b0' }}>{profile.stats.winRatePeriod}</span>
                            </div>
                        </div>

                        {/* Transparency Gauge */}
                        <div className="transparency-gauge">
                            <div className="gauge-circle">
                                <svg viewBox="0 0 36 36">
                                    <path
                                        className="gauge-bg"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="gauge-progress"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="gauge-value">{profile.transparencyScore}</div>
                            </div>
                            <div className="gauge-info">
                                <span className="gauge-label">Transparency Score</span>
                                <span className="gauge-status">Highly Trusted</span>
                                <span className="gauge-verified">ℹ️ Verified by Algorithm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bet History Section */}
            <div className="history-section">
                <div className="history-tabs">
                    <button className="history-tab active">
                        📜 Bet History
                    </button>
                    <button className="history-tab">
                        📊 Analytics
                    </button>
                    <button className="history-tab">
                        💬 Community
                    </button>
                </div>

                <div className="history-header">
                    <div className="history-title">
                        <h3>Recent Plays</h3>
                        <span className="history-count">{profile.totalBets} Total</span>
                    </div>
                </div>

                <div className="bet-list">
                    {bets.map((bet) => (
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
                                        <span className="bet-stake">Stake: <span>{bet.stake}</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="bet-result">
                                {bet.isVerified ? (
                                    <div className="ocr-badge">
                                        <span>✓ Verified by OCR</span>
                                    </div>
                                ) : (
                                    <div className="unverified-badge">
                                        <span>⚠️ Unverified</span>
                                    </div>
                                )}

                                <div className="outcome">
                                    <span className={`outcome-status ${bet.status}`}>
                                        {bet.status.toUpperCase()}
                                    </span>
                                    <span className={`outcome-amount ${bet.status}`}>
                                        {bet.profit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="load-more-btn">
                    Load More History
                </button>
            </div>
        </div>
    )
}
