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

    // Récupérer l'agent connecté depuis localStorage
    const agentConnecte = JSON.parse(localStorage.getItem('agent') || '{}')
    const isAdmin = agentConnecte.role === 'admin'
    const isSuperviseur = agentConnecte.role === 'superviseur'
    const peutGerer = isAdmin || isSuperviseur // seuls admin et superviseur voient cette page

    useEffect(() => { loadAgents() }, [])

    async function loadAgents() {
        setLoading(true)
        let query = supabase
            .from('agents')
            .select('*')
            .order('created_at', { ascending: false })

        // Un agent simple ne voit que les autres agents (pas les admins, pas lui-même)
        if (!isAdmin) {
            query = query.neq('role', 'admin')
        }

        const { data, error } = await query

        if (error) {
            console.error('Erreur chargement agents :', error.message)
        } else {
            // Filtrer : un agent ne se voit pas lui-même
            const liste = isAdmin
                ? data || []
                : (data || []).filter(a => a.id !== agentConnecte.id)
            setAgents(liste)
        }
        setLoading(false)
    }

    async function addAgent(e) {
        e.preventDefault()
        setSaving(true)

        const { error } = await supabase.from('agents').insert({
            nom: form.nom,
            email: form.email,
            mot_de_passe: form.mot_de_passe,
            role: form.role,
            actif: true,
        })

        if (error) {
            alert('Erreur : ' + error.message)
            setSaving(false)
            return
        }

        setForm({ nom: '', email: '', mot_de_passe: '', role: 'agent' })
        setShowForm(false)
        await loadAgents()
        setSaving(false)
    }

    async function toggleActif(id, actif) {
        const { error } = await supabase
            .from('agents')
            .update({ actif: !actif })
            .eq('id', id)

        if (error) {
            alert('Erreur : ' + error.message)
            return
        }
        await loadAgents()
    }

    const roleColors = {
        admin: 'badge-red',
        superviseur: 'badge-blue',
        agent: 'badge-green'
    }

    const roleLabels = {
        admin: 'Administrateur',
        superviseur: 'Superviseur',
        agent: 'Agent'
    }

    // Si c'est un simple agent — accès refusé
    if (!peutGerer) {
        return (
            <div className="page">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh',
                    gap: 16,
                    color: '#64748B'
                }}>
                    <span style={{ fontSize: 64 }}>🔒</span>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B' }}>
                        Accès refusé
                    </h2>
                    <p style={{ fontSize: 14, textAlign: 'center', maxWidth: 340 }}>
                        Vous n'avez pas les droits nécessaires pour accéder à la gestion des agents.
                        Contactez votre administrateur.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="page">

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 28
            }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>
                        Gestion des agents
                    </h1>
                    <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                        {agents.length} agent{agents.length > 1 ? 's' : ''} —
                        <span style={{
                            marginLeft: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '2px 10px',
                            borderRadius: 20,
                            background: isAdmin ? '#FEF2F2' : '#EFF6FF',
                            color: isAdmin ? '#EF4444' : '#3B82F6'
                        }}>
                            Connecté en tant que {roleLabels[agentConnecte.role]}
                        </span>
                    </p>
                </div>

                {/* Seul l'admin peut ajouter des agents */}
                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '10px 20px' }}
                        onClick={() => setShowForm(true)}
                    >
                        + Ajouter un agent
                    </button>
                )}
            </div>

            {/* Bandeau info rôle */}
            {isSuperviseur && !isAdmin && (
                <div style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 20,
                    fontSize: 13,
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    ℹ️ En tant que superviseur, vous pouvez consulter la liste des agents mais pas les gérer.
                </div>
            )}

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
                            {isAdmin && <th>Actions</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {agents.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 5 : 4}>
                                    <div className="empty-state">
                                        <span>👥</span>
                                        Aucun agent enregistré
                                    </div>
                                </td>
                            </tr>
                        ) : agents.map(a => (
                            <tr key={a.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 10,
                                            background: '#E1F5EE',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: '#0F6E56',
                                            flexShrink: 0
                                        }}>
                                            {a.nom?.[0]?.toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{a.nom}</span>
                                        {a.id === agentConnecte.id && (
                                            <span style={{
                                                fontSize: 10,
                                                background: '#E1F5EE',
                                                color: '#0F6E56',
                                                padding: '2px 8px',
                                                borderRadius: 20,
                                                fontWeight: 600
                                            }}>
                                                Vous
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ color: '#64748B' }}>{a.email}</td>
                                <td>
                                    <span className={`badge ${roleColors[a.role] || 'badge-gray'}`}>
                                        {roleLabels[a.role] || a.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${a.actif ? 'badge-green' : 'badge-gray'}`}>
                                        {a.actif ? '● Actif' : '○ Inactif'}
                                    </span>
                                </td>

                                {/* Actions — seulement pour l'admin et pas sur son propre compte */}
                                {isAdmin && (
                                    <td>
                                        {a.id !== agentConnecte.id ? (
                                            <button
                                                className={`action-btn ${a.actif ? 'action-btn-danger' : 'action-btn-primary'}`}
                                                onClick={() => toggleActif(a.id, a.actif)}
                                            >
                                                {a.actif ? 'Désactiver' : 'Activer'}
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: 12, color: '#94A3B8' }}>
                                                — votre compte
                                            </span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal ajout agent — admin uniquement */}
            {showForm && isAdmin && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>👤 Ajouter un agent</h3>
                        <form onSubmit={addAgent}>
                            <div className="modal-field" style={{ marginBottom: 16 }}>
                                <label style={{
                                    display: 'block', fontSize: 12, fontWeight: 600,
                                    color: '#64748B', marginBottom: 6, textTransform: 'uppercase'
                                }}>
                                    Nom complet
                                </label>
                                <input
                                    style={{
                                        width: '100%', height: 40, border: '1.5px solid #E2E8F0',
                                        borderRadius: 8, padding: '0 12px', fontSize: 14
                                    }}
                                    placeholder="Kouassi Jean"
                                    value={form.nom}
                                    onChange={e => setForm({ ...form, nom: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-field" style={{ marginBottom: 16 }}>
                                <label style={{
                                    display: 'block', fontSize: 12, fontWeight: 600,
                                    color: '#64748B', marginBottom: 6, textTransform: 'uppercase'
                                }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    style={{
                                        width: '100%', height: 40, border: '1.5px solid #E2E8F0',
                                        borderRadius: 8, padding: '0 12px', fontSize: 14
                                    }}
                                    placeholder="agent@daa.ci"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-field" style={{ marginBottom: 16 }}>
                                <label style={{
                                    display: 'block', fontSize: 12, fontWeight: 600,
                                    color: '#64748B', marginBottom: 6, textTransform: 'uppercase'
                                }}>
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    style={{
                                        width: '100%', height: 40, border: '1.5px solid #E2E8F0',
                                        borderRadius: 8, padding: '0 12px', fontSize: 14
                                    }}
                                    placeholder="••••••••"
                                    value={form.mot_de_passe}
                                    onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="modal-field" style={{ marginBottom: 16 }}>
                                <label style={{
                                    display: 'block', fontSize: 12, fontWeight: 600,
                                    color: '#64748B', marginBottom: 6, textTransform: 'uppercase'
                                }}>
                                    Rôle
                                </label>
                                <select
                                    style={{
                                        width: '100%', height: 40, border: '1.5px solid #E2E8F0',
                                        borderRadius: 8, padding: '0 12px', fontSize: 14
                                    }}
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                >
                                    <option value="agent">Agent</option>
                                    <option value="superviseur">Superviseur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>

                            {/* Info rôles */}
                            <div style={{
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: 8,
                                padding: '12px 14px',
                                marginBottom: 16,
                                fontSize: 12,
                                color: '#64748B',
                                lineHeight: 1.6
                            }}>
                                <strong>Agent</strong> — Voir les signalements, changer les statuts<br/>
                                <strong>Superviseur</strong> — Agent + voir la liste des agents<br/>
                                <strong>Admin</strong> — Accès complet + gérer les agents
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
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