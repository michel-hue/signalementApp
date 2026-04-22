import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import { supabase } from '../lib/supabase'
import 'leaflet/dist/leaflet.css'
import '../styles/carte.css'
import '../styles/dashboard.css'

const ABOBO_CENTER = [5.3742, -4.0167]

const statusColor = s =>
    s === 'traite' ? '#10B981' : s === 'en_cours' ? '#F59E0B' : '#EF4444'

const statusLabel = s =>
    s === 'traite' ? 'Résolu' : s === 'en_cours' ? 'En cours' : 'En attente'

export default function Carte() {
    const [signalements, setSignalements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadSignalements() }, [])

    async function loadSignalements() {
        setLoading(true)
        const { data } = await supabase
            .from('signalements')
            .select('*, types_problemes(libelle)')
            .not('latitude', 'is', null)
        setSignalements(data || [])
        setLoading(false)
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>Carte des signalements</h1>
                <p>Visualisation géographique — Rue Koné Tiémoman</p>
            </div>

            <div className="map-legend">
                {[
                    { color: '#EF4444', label: 'En attente' },
                    { color: '#F59E0B', label: 'En cours' },
                    { color: '#10B981', label: 'Résolu' },
                ].map(l => (
                    <div key={l.label} className="legend-item">
                        <div className="legend-dot" style={{ background: l.color }} />
                        {l.label}
                    </div>
                ))}
                <button
                    className="badge badge-blue"
                    style={{ cursor: 'pointer', marginLeft: 'auto' }}
                    onClick={loadSignalements}
                >
                    🔄 Actualiser ({signalements.length})
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner">⏳ Chargement de la carte...</div>
            ) : (
                <div className="carte-container">
                    <MapContainer
                        center={ABOBO_CENTER}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        {signalements.map(s => (
                            <CircleMarker
                                key={s.id}
                                center={[s.latitude, s.longitude]}
                                radius={10}
                                pathOptions={{
                                    color: statusColor(s.statut),
                                    fillColor: statusColor(s.statut),
                                    fillOpacity: 0.8,
                                    weight: 2,
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: 200 }}>
                                        <strong style={{ fontSize: 14 }}>
                                            {s.types_problemes?.libelle || 'Signalement'}
                                        </strong>
                                        <br />
                                        <span style={{
                                            background: statusColor(s.statut),
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: 20,
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}>
                      {statusLabel(s.statut)}
                    </span>
                                        <br /><br />
                                        <span style={{ fontSize: 12, color: '#64748B' }}>
                      Ref: <strong>{s.token_suivi}</strong>
                    </span>
                                        {s.description && (
                                            <>
                                                <br />
                                                <span style={{ fontSize: 12 }}>{s.description}</span>
                                            </>
                                        )}
                                        <br />
                                        <span style={{ fontSize: 11, color: '#94A3B8' }}>
                      {s.latitude?.toFixed(5)}, {s.longitude?.toFixed(5)}
                    </span>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            )}
        </div>
    )
}