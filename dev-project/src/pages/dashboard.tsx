import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import '../styles/dashboard.css'

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981']

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}j`
}

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, en_attente: 0, en_cours: 0, traite: 0 })
    const [recents, setRecents] = useState([])
    const [chartData, setChartData] = useState([])
    const [pieData, setPieData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        try {
            // Stats globales
            const { data: tous } = await supabase.from('signalements').select('id, statut, created_at')
            const total = tous?.length || 0
            const en_attente = tous?.filter(s => s.statut === 'en_attente').length || 0
            const en_cours = tous?.filter(s => s.statut === 'en_cours').length || 0
            const traite = tous?.filter(s => s.statut === 'traite').length || 0
            setStats({ total, en_attente, en_cours, traite })

            // Récents
            const { data: rec } = await supabase
                .from('signalements')
                .select('*, types_problemes(libelle)')
                .order('created_at', { ascending: false })
                .limit(5)
            setRecents(rec || [])

            // Chart par type
            const { data: byType } = await supabase
                .from('signalements')
                .select('types_problemes(libelle)')
            const typeCount = {}
            byType?.forEach(s => {
                const l = s.types_problemes?.libelle || 'Autre'
                typeCount[l] = (typeCount[l] || 0) + 1
            })
            setChartData(Object.entries(typeCount).map(([name, value]) => ({ name: name.substring(0, 8), value })))
            setPieData(Object.entries(typeCount).map(([name, value]) => ({ name, value })))

        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const statCards = [
        { label: 'Total signalements', value: stats.total, icon: '📋', color: '#3B82F6', bg: '#EFF6FF', trend: 'Total' },
        { label: 'En attente', value: stats.en_attente, icon: '⏳', color: '#F59E0B', bg: '#FFFBEB', trend: 'À traiter' },
        { label: 'En cours', value: stats.en_cours, icon: '🔧', color: '#8B5CF6', bg: '#F5F3FF', trend: 'En intervention' },
        { label: 'Résolus', value: stats.traite, icon: '✅', color: '#10B981', bg: '#ECFDF5', trend: `${stats.total > 0 ? Math.round((stats.traite / stats.total) * 100) : 0}%` },
    ]

    if (loading) return <div className="page"><div className="loading-spinner">⏳ Chargement...</div></div>

    return (
        <div className="page">
            <div className="page-header">
                <h1>Tableau de bord</h1>
                <p>Vue d'ensemble — Rue Koné Tiémoman, Abobo</p>
            </div>

            <div className="stats-grid">
                {statCards.map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon" style={{ background: s.bg }}>
                                {s.icon}
                            </div>
                            <span className="badge badge-gray">{s.trend}</span>
                        </div>
                        <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Graphique barres */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Signalements par type</div>
                            <div className="card-subtitle">Données en temps réel</div>
                        </div>
                        <span className="badge badge-green">Live</span>
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#0F6E56" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state"><span>📊</span>Aucune donnée</div>
                    )}
                </div>

                {/* Pie chart statuts */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Répartition par statut</div>
                            <div className="card-subtitle">En cours vs résolus</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'En attente', value: stats.en_attente },
                                    { name: 'En cours', value: stats.en_cours },
                                    { name: 'Résolus', value: stats.traite },
                                ]}
                                cx="50%" cy="50%"
                                innerRadius={55} outerRadius={85}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                                labelLine={false}
                            >
                                {['#F59E0B', '#8B5CF6', '#10B981'].map((color, i) => (
                                    <Cell key={i} fill={color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activité récente */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Activité récente</div>
                        <div className="card-subtitle">5 derniers signalements</div>
                    </div>
                    <button
                        className="badge badge-blue"
                        style={{ cursor: 'pointer' }}
                        onClick={loadData}
                    >
                        🔄 Actualiser
                    </button>
                </div>
                <div className="recent-list">
                    {recents.length === 0 ? (
                        <div className="empty-state"><span>📭</span>Aucun signalement</div>
                    ) : recents.map((s, i) => {
                        const statut = s.statut
                        const badgeClass = statut === 'traite' ? 'badge-green' : statut === 'en_cours' ? 'badge-amber' : 'badge-gray'
                        const label = statut === 'traite' ? 'Résolu' : statut === 'en_cours' ? 'En cours' : 'Soumis'
                        return (
                            <div key={i} className="recent-item">
                                <div className="recent-icon" style={{ background: '#E1F5EE' }}>📍</div>
                                <div className="recent-info">
                                    <div className="recent-title">{s.types_problemes?.libelle || 'Signalement'}</div>
                                    <div className="recent-sub">{s.token_suivi}</div>
                                </div>
                                <span className={`badge ${badgeClass}`}>{label}</span>
                                <span className="recent-time">{timeAgo(s.created_at)}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}