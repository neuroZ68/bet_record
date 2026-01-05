import { useState } from 'react'
import './Feed.css'

// Mock data for the feed
const MOCK_FEED_ITEMS = [
    {
        id: '1',
        type: 'bet',
        user: {
            name: 'SharpShooter99',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sharp',
            isVerified: true,
        },
        timestamp: '2 hours ago',
        sport: 'NBA',
        bet: {
            title: 'Lakers -3.5 vs Celtics',
            odds: '-110',
            stake: '$500.00',
            imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
        },
        likes: 24,
        comments: 8,
    },
    {
        id: '2',
        type: 'achievement',
        user: {
            name: 'BetKing',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=King',
        },
        streakCount: 7,
        profit: '+$3,450',
    },
    {
        id: '3',
        type: 'completed_bet',
        user: {
            name: 'UnderdogLover',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Underdog',
        },
        timestamp: 'Yesterday',
        sport: 'NFL Parlay',
        result: 'win',
        legs: ['Chiefs ML', 'Over 48.5 Pts', 'Kelce TD'],
        wagered: '$100.00',
        payout: '$500.00',
        roi: '+400%',
    },
]

type FeedTab = 'following' | 'trending' | 'high-rollers'

export function Feed() {
    const [activeTab, setActiveTab] = useState<FeedTab>('following')

    return (
        <div className="feed-page">
            {/* Header */}
            <div className="feed-header">
                <h1 className="feed-title">Community Feed</h1>

                {/* Tabs */}
                <div className="feed-tabs">
                    <button
                        className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
                        onClick={() => setActiveTab('following')}
                    >
                        Following
                    </button>
                    <button
                        className={`feed-tab ${activeTab === 'trending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trending')}
                    >
                        Trending
                    </button>
                    <button
                        className={`feed-tab ${activeTab === 'high-rollers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('high-rollers')}
                    >
                        High Rollers
                    </button>
                </div>
            </div>

            {/* Feed List */}
            <div className="feed-list">
                {MOCK_FEED_ITEMS.map((item) => {
                    if (item.type === 'bet') {
                        return (
                            <article key={item.id} className="feed-card">
                                <div className="feed-card-content">
                                    {/* Header */}
                                    <div className="card-header">
                                        <div className="user-info">
                                            <div
                                                className="user-avatar"
                                                style={{ backgroundImage: `url(${item.user.avatar})` }}
                                            />
                                            <div className="user-details">
                                                <h3>
                                                    {item.user.name}
                                                    {item.user.isVerified && <span className="verified-icon">✓</span>}
                                                </h3>
                                                <p className="user-meta">{item.timestamp} • {item.sport}</p>
                                            </div>
                                        </div>
                                        <span className="verified-badge">
                                            🔒 Verified Bet
                                        </span>
                                    </div>

                                    {/* Bet Content */}
                                    <div className="bet-content">
                                        <div
                                            className="bet-image"
                                            style={{ backgroundImage: `url(${item.bet.imageUrl})` }}
                                        />
                                        <div className="bet-details">
                                            <h4 className="bet-title">{item.bet.title}</h4>
                                            <div className="bet-stats">
                                                <div className="stat-item">
                                                    <span className="stat-label">Odds</span>
                                                    <span className="stat-value">{item.bet.odds}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-label">Stake</span>
                                                    <span className="stat-value">{item.bet.stake}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="card-footer">
                                        <div className="social-actions">
                                            <button className="action-btn">👍 {item.likes}</button>
                                            <button className="action-btn">💬 {item.comments}</button>
                                        </div>
                                        <button className="tail-btn">
                                            📋 Tail Bet
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )
                    }

                    if (item.type === 'achievement') {
                        return (
                            <article key={item.id} className="achievement-card">
                                <div className="achievement-content">
                                    <div className="achievement-user">
                                        <div className="achievement-avatar" style={{ backgroundImage: `url(${item.user.avatar})` }}>
                                            <div className="streak-badge">
                                                <span className="streak-badge-icon">🔥</span>
                                            </div>
                                        </div>
                                        <div className="achievement-info">
                                            <span className="streak-tag">Hot Streak</span>
                                            <h3>{item.user.name} hit {item.streakCount} Wins in a Row!</h3>
                                            <p>Total Profit: <span className="profit">{item.profit}</span> this week.</p>
                                        </div>
                                    </div>
                                    <button className="view-streak-btn">
                                        View Streak →
                                    </button>
                                </div>
                            </article>
                        )
                    }

                    if (item.type === 'completed_bet') {
                        return (
                            <article key={item.id} className="feed-card">
                                <div className="feed-card-content">
                                    {/* Header with Win badge */}
                                    <div className="card-header">
                                        <div className="user-info">
                                            <div
                                                className="user-avatar"
                                                style={{ backgroundImage: `url(${item.user.avatar})` }}
                                            />
                                            <div className="user-details">
                                                <h3>{item.user.name}</h3>
                                                <p className="user-meta">{item.timestamp} • {item.sport}</p>
                                            </div>
                                        </div>
                                        <span className="verified-badge" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                                            ✓ Verified Win
                                        </span>
                                    </div>

                                    {/* Parlay Details */}
                                    <div style={{
                                        background: '#0f172a',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        border: '1px solid #1e293b'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>3-Leg Parlay</span>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>{item.roi} ROI</span>
                                        </div>

                                        {item.legs.map((leg, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: '#94a3b8',
                                                fontSize: '0.875rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <span style={{ color: '#10b981' }}>✓</span>
                                                <span style={{ textDecoration: 'line-through' }}>{leg}</span>
                                            </div>
                                        ))}

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            borderTop: '1px solid #1e293b',
                                            paddingTop: '0.75rem',
                                            marginTop: '0.75rem'
                                        }}>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Wagered</p>
                                                <p style={{ fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{item.wagered}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Payout</p>
                                                <p style={{ fontWeight: 700, color: '#10b981', fontSize: '1.25rem', fontFamily: 'monospace' }}>{item.payout}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )
                    }

                    return null
                })}

                {/* Loading indicator */}
                <div className="feed-loading">
                    <div className="spinner" />
                </div>
            </div>
        </div>
    )
}
