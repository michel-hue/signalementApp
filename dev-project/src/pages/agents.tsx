import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/signalements.css'
import '../styles/dashboard.css'

export default function Agents() {
    const [agents, setAgents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: '', role: 'agent' })
    const [saving, setSaving] = useState(false)

    useEffect(() => { loadAgents() }, [])

    async function loadAgents() {
        setLoading(true)
        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erreur Supabase:', error)
        } else {
            setAgents(data || [])
        }
        setLoading(false)
    }

    async function addAgent(e) {
        e.preventDefault()
        setSaving(true)
        await supabase.from('agents').insert({
            nom: form.nom,
            email: form.email,
            mot_de_passe: form.mot_de_passe,
            role: form.role,
            actif: true,
        })
        setForm({ nom: '', email: '', mot_de_passe: '', role: 'agent' })
        setShowForm(false)
        await loadAgents()
        setSaving(false)
    }

    async function toggleActif(id, actif) {
        await supabase.from('agents').update({ actif: !actif }).eq('id', id)
        await loadAgents()
    }

    const roleColors = { admin: 'badge-red', superviseur: 'badge-blue', agent: 'badge-green' }

    return (
        <div className="page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Gestion des agents</h1>
                    <p>{agents.length} agent{agents.length > 1 ? 's' : ''} enregistré{agents.length > 1 ? 's' : ''}</p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '10px 20px' }}
                    onClick={() => setShowForm(true)}
                >
                    + Ajouter un agent
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner">⏳ Chargement...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {agents.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="empty-state">
                                        <span>👥</span>
                                        Aucun agent enregistré
                                    </div>
                                </td>
                            </tr>
                        ) : agents.map(a => (
                            <tr key={a.id}>
                                <td style={{ fontWeight: 600 }}>{a.nom}</td>
                                <td>{a.email}</td>
                                <td>
                    <span className={`badge ${roleColors[a.role] || 'badge-gray'}`}>
                      {a.role}
                    </span>
                                </td>
                                <td>
                    <span className={`badge ${a.actif ? 'badge-green' : 'badge-gray'}`}>
                      {a.actif ? 'Actif' : 'Inactif'}
                    </span>
                                </td>
                                <td>
                                    <button
                                        className={`action-btn ${a.actif ? 'action-btn-danger' : 'action-btn-primary'}`}
                                        onClick={() => toggleActif(a.id, a.actif)}
                                    >
                                        {a.actif ? 'Désactiver' : 'Activer'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal ajout agent */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>👤 Ajouter un agent</h3>
                        <form onSubmit={addAgent}>
                            <div className="modal-field" style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>
                                    Nom complet
                                </label>
                                <input
                                    style={{ width: '100%', height: 40, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0 12px', fontSize: 14 }}
                                    placeholder="Kouassi Jean"
                                    value={form.nom}
                                    onChange={e => setForm({ ...form, nom: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-field" style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    style={{ width: '100%', height: 40, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0 12px', fontSize: 14 }}
                                    placeholder="agent@daa.ci"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-field" style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    style={{ width: '100%', height: 40, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0 12px', fontSize: 14 }}
                                    placeholder="••••••••"
                                    value={form.mot_de_passe}
                                    onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-field" style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>
                                    Rôle
                                </label>
                                <select
                                    style={{ width: '100%', height: 40, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0 12px', fontSize: 14 }}
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                >
                                    <option value="agent">Agent</option>
                                    <option value="superviseur">Superviseur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Enregistrement...' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}