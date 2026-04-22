import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/global.css'
import './styles/sidebar.css'
import Sidebar from "./components/sidebar.tsx";
import Dashboard from "./pages/dashboard.tsx";
import Signalements from "./pages/signalement.tsx";
import Carte from "./pages/carte.tsx";
import Agents from "./pages/agents.tsx";
import Login from "./pages/login.tsx";

export default function App() {
    const [agent, setAgent] = useState(null)

    useEffect(() => {
        const stored = localStorage.getItem('agent')
        if (stored) setAgent(JSON.parse(stored))
    }, [])

    function handleLogout() {
        localStorage.removeItem('agent')
        setAgent(null)
    }

    if (!agent) return <Login onLogin={setAgent} />

    return (
        <BrowserRouter>
            <div className="layout">
                <Sidebar onLogout={handleLogout} agentNom={agent.nom} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/signalements" element={<Signalements />} />
                        <Route path="/carte" element={<Carte />} />
                        <Route path="/agents" element={<Agents />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}