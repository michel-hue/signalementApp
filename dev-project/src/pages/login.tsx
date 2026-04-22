import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/login.css'

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Vérification dans la table agents
        const { data, error: err } = await supabase
            .from('agents')
            .select('*')
            .eq('email', email)
            .eq('actif', true)
            .single()

        if (err || !data) {
            setError('Email ou mot de passe incorrect.')
            setLoading(false)
            return
        }

        // Pour la démo on compare directement
        // En production utilise bcrypt côté serveur
        if (data.mot_de_passe !== password) {
            setError('Email ou mot de passe incorrect.')
            setLoading(false)
            return
        }

        localStorage.setItem('agent', JSON.stringify(data))
        onLogin(data)
        setLoading(false)
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">K</div>
                    <div>
                        <h1>KonePropre</h1>
                        <span>District Autonome d'Abidjan</span>
                    </div>
                </div>

                <h2 className="login-title">Connexion</h2>
                <p className="login-subtitle">
                    Accès réservé aux agents du DAA
                </p>

                {error && <div className="login-error">⚠️ {error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Adresse email</label>
                        <input
                            type="email"
                            placeholder="agent@daa.ci"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="login-btn" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    )
}