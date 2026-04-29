import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/signalements.css'
import '../styles/dashboard.css'

const FILTERS = [
    { label: 'Tous', value: '' },
    { label: 'En attente', value: 'en_attente' },
    { label: 'En cours', value: 'en_cours' },
    { label: 'Résolus', value: 'traite' },
]

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}j`
}

export default function Signalements() {
    const [signalements, setSignalements] = useState([])
    const [filtered, setFiltered] = useState([])
    const [filterStatut, setFilterStatut] = useState('')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [updating, setUpdating] = useState(false)

    useEffect(() => { loadSignalements() }, [])

    useEffect(() => {
        let result = signalements
        if (filterStatut) result = result.filter(s => s.statut === filterStatut)
        if (search) result = result.filter(s =>
            s.token_suivi?.toLowerCase().includes(search.toLowerCase()) ||
            s.types_problemes?.libelle?.toLowerCase().includes(search.toLowerCase())
        )
        setFiltered(result)
    }, [filterStatut, search, signalements])

    async function loadSignalements() {
        setLoading(true)
        const { data } = await supabase
            .from('signalements')
            .select('*, types_problemes(libelle), zones(nom)')
            .order('created_at', { ascending: false })
        setSignalements(data || [])
        setLoading(false)
    }

    async function updateStatut(id, newStatut) {
        setUpdating(true)
        await supabase
            .from('signalements')
            .update({ statut: newStatut, updated_at: new Date().toISOString() })
            .eq('id', id)
        await loadSignalements()
        setSelected(prev => prev ? { ...prev, statut: newStatut } : null)
        setUpdating(false)
    }

    const badgeClass = s =>
        s === 'traite' ? 'badge-green' : s === 'en_cours' ? 'badge-amber' : 'badge-gray'
    const badgeLabel = s =>
        s === 'traite' ? 'Résolu' : s === 'en_cours' ? 'En cours' : 'En attente'

    return (
        <div className="page">
            <div className="page-header">
                <h1>Signalements</h1>
                <p>{filtered.length} signalement{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p>
            </div>

            <div className="filters-bar">
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        className={`filter-chip ${filterStatut === f.value ? 'active' : ''}`}
                        onClick={() => setFilterStatut(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
                <div className="search-input">
                    <span>🔍</span>
                    <input
                        placeholder="Rechercher par token ou type..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">⏳ Chargement...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Référence</th>
                            <th>Type</th>
                            <th>Zone</th>
                            <th>Coordonnées</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state">
                                        <span>📭</span>
                                        Aucun signalement
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map(s => (
                            <tr key={s.id} onClick={() => setSelected(s)}>
                                <td><span className="token-cell">{s.token_suivi}</span></td>
                                <td>
                                    <div className="type-cell">
                                        <span className="type-dot" style={{ background: '#0F6E56' }} />
                                        {s.types_problemes?.libelle || '—'}
                                    </div>
                                </td>
                                <td>{s.zones?.nom || 'Non définie'}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                                    {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                                </td>
                                <td>
                    <span className={`badge ${badgeClass(s.statut)}`}>
                      {badgeLabel(s.statut)}
                    </span>
                                </td>
                                <td>{timeAgo(s.created_at)}</td>
                                <td onClick={e => e.stopPropagation()}>
                                    {s.statut === 'en_attente' && (
                                        <button
                                            className="action-btn action-btn-primary"
                                            onClick={() => updateStatut(s.id, 'en_cours')}
                                        >
                                            Prendre en charge
                                        </button>
                                    )}
                                    {s.statut === 'en_cours' && (
                                        <button
                                            className="action-btn action-btn-primary"
                                            onClick={() => updateStatut(s.id, 'traite')}
                                        >
                                            Marquer résolu
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
                    </div>
                </div>
            )}

            {/* Modal détail */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>📋 Détail du signalement</h3>

                        <div className="modal-field">
                            <label>Référence</label>
                            <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700 }}>
                                {selected.token_suivi}
                            </p>
                        </div>

                        <div className="modal-field">
                            <label>Type de problème</label>
                            <p>{selected.types_problemes?.libelle}</p>
                        </div>

                        <div className="modal-field">
                            <label>Description</label>
                            <p>{selected.description || 'Aucune description'}</p>
                        </div>

                        {/* ← AJOUT PHOTO ICI */}
                        {selected.photo_url && (
                            <div className="modal-field">
                                <label>Photo</label>
                                <img
                                    src={selected.photo_url}
                                    alt="Photo du signalement"
                                    style={{
                                        width: '100%',
                                        height: 200,
                                        objectFit: 'cover',
                                        borderRadius: 12,
                                        marginTop: 8,
                                        border: '1px solid #E2E8F0'
                                    }}
                                    onError={e => {
                                        const img = e.target as HTMLImageElement
                                        img.style.display = 'none'
                                    }}
                                />
                            </div>
                        )}

                        <div className="modal-field">
                            <label>Coordonnées GPS</label>
                            <p style={{ fontFamily: 'monospace' }}>
                                {selected.latitude?.toFixed(6)}, {selected.longitude?.toFixed(6)}
                            </p>
                        </div>

                        <div className="modal-field">
                            <label>Statut actuel</label>
                            <span className={`badge ${badgeClass(selected.statut)}`}>
                    {badgeLabel(selected.statut)}
                </span>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                                Fermer
                            </button>
                            {selected.statut === 'en_attente' && (
                                <button
                                    className="btn btn-primary"
                                    disabled={updating}
                                    onClick={() => updateStatut(selected.id, 'en_cours')}
                                >
                                    {updating ? '...' : 'Prendre en charge'}
                                </button>
                            )}
                            {selected.statut === 'en_cours' && (
                                <button
                                    className="btn btn-success"
                                    disabled={updating}
                                    onClick={() => updateStatut(selected.id, 'traite')}
                                >
                                    {updating ? '...' : '✅ Marquer résolu'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}