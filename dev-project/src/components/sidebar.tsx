import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/sidebar.css'

const navItems = [
    { icon: '📊', label: 'Tableau de bord', path: '/dashboard' },
    { icon: '📋', label: 'Signalements', path: '/signalements', badge: null },
    { icon: '🗺️', label: 'Carte', path: '/carte' },
    { icon: '👥', label: 'Agents', path: '/agents' },
]

export default function Sidebar({ onLogout, agentNom }) {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">K</div>
                <div>
                    <h2>KonePropre</h2>
                    <span>Administration</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Navigation</div>
                {navItems.map(item => (
                    <button
                        key={item.path}
                        className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="icon">{item.icon}</span>
                        {item.label}
                        {item.badge && <span className="badge">{item.badge}</span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {agentNom ? agentNom[0].toUpperCase() : 'A'}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{agentNom || 'Administrateur'}</div>
                        <div className="sidebar-user-role">Admin DAA</div>
                    </div>
                    <button className="logout-btn" onClick={onLogout} title="Déconnexion">
                        ⎋
                    </button>
                </div>
            </div>
        </aside>
    )
}