import React, { useState, useEffect } from 'react';

/* =========================
   Local storage helpers
========================= */

const STORAGE_KEY = 'pesate_local';

function loadPesateLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function savePesateLocal(pesate) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pesate));
}

/* =========================
   Main component
========================= */

function WeightPage() {
    const [pesate, setPesate] = useState({});
    const [peso, setPeso] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [timeframe, setTimeframe] = useState('settimana');

    const today = new Date().toISOString().split('T')[0];

    /* === Load from localStorage === */
    useEffect(() => {
        const data = loadPesateLocal();
        setPesate(data);
        setLoading(false);
    }, []);

    /* === Save weight === */
    const handleSave = (e) => {
        e.preventDefault();
        if (!peso) return;

        setSaving(true);
        try {
            const updated = {
                ...pesate,
                [today]: {
                    peso: parseFloat(peso)
                }
            };

            setPesate(updated);
            savePesateLocal(updated);

            setPeso('');
            alert('✅ Pesata salvata!');
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('❌ Errore nel salvataggio locale');
        } finally {
            setSaving(false);
        }
    };

    /* === Delete weight === */
    const handleDelete = (date) => {
        if (!window.confirm('Vuoi eliminare questa pesata?')) return;

        const updated = { ...pesate };
        delete updated[date];

        setPesate(updated);
        savePesateLocal(updated);
    };

    /* =========================
       Metrics
    ========================= */

    const getMetrics = () => {
        const entries = Object.entries(pesate).sort((a, b) =>
            a[0].localeCompare(b[0])
        );
        if (entries.length === 0) return null;

        const pesi = entries.map(([_, data]) => data.peso);
        const pesoIniziale = pesi[0];
        const pesoAttuale = pesi[pesi.length - 1];
        const differenza = pesoAttuale - pesoIniziale;
        const percentuale = ((differenza / pesoIniziale) * 100).toFixed(2);

        let filteredEntries = entries;
        const now = new Date();

        if (timeframe === 'settimana') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredEntries = entries.filter(
                ([date]) => new Date(date) >= weekAgo
            );
        } else if (timeframe === 'mese') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filteredEntries = entries.filter(
                ([date]) => new Date(date) >= monthAgo
            );
        }

        const filteredPesi = filteredEntries.map(([_, data]) => data.peso);
        const pesoMin = Math.min(...filteredPesi);
        const pesoMax = Math.max(...filteredPesi);
        const media = (
            filteredPesi.reduce((a, b) => a + b, 0) / filteredPesi.length
        ).toFixed(1);

        return {
            pesoIniziale,
            pesoAttuale,
            differenza,
            percentuale,
            pesoMin,
            pesoMax,
            media,
            entries: filteredEntries
        };
    };

    const metrics = getMetrics();
    const todayPesata = pesate[today];

    /* =========================
       UI
    ========================= */

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                Caricamento...
            </div>
        );
    }

    return (
        <div className="container weight-container">

            {/* INPUT */}
            <div className="weight-input-card glass-strong">
                <div className="date-display">
                    <div className="date-label">OGGI</div>
                    <div className="date-value">{formatDate(today)}</div>
                </div>

                {todayPesata ? (
                    <div className="peso-salvato">
                        <div className="peso-salvato-value">
                            {todayPesata.peso} kg
                        </div>
                        <button
                            className="delete-btn-mini"
                            onClick={() => handleDelete(today)}
                        >
                            Elimina
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="peso-input-form">
                        <input
                            type="number"
                            step="0.1"
                            value={peso}
                            onChange={(e) => setPeso(e.target.value)}
                            placeholder="75.5"
                            required
                            className="peso-input"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="save-btn-mini"
                            disabled={saving}
                        >
                            {saving ? '...' : 'Salva'}
                        </button>
                    </form>
                )}
            </div>

            {/* METRICHE */}
            {metrics && (
                <>
                    <div className="timeframe-selector">
                        <button
                            className={`timeframe-btn ${timeframe === 'settimana' ? 'active' : ''}`}
                            onClick={() => setTimeframe('settimana')}
                        >
                            Settimana
                        </button>
                        <button
                            className={`timeframe-btn ${timeframe === 'mese' ? 'active' : ''}`}
                            onClick={() => setTimeframe('mese')}
                        >
                            Mese
                        </button>
                        <button
                            className={`timeframe-btn ${timeframe === 'tutto' ? 'active' : ''}`}
                            onClick={() => setTimeframe('tutto')}
                        >
                            Tutto
                        </button>
                    </div>

                    <div className="metrics-grid">
                        <Metric label="Attuale" value={metrics.pesoAttuale} />
                        <Metric label="Variazione" value={metrics.differenza.toFixed(1)} unit="kg" />
                        <Metric label="Progresso" value={metrics.percentuale} unit="%" />
                        <Metric label="Media" value={metrics.media} />
                        <Metric label="Min" value={metrics.pesoMin} />
                        <Metric label="Max" value={metrics.pesoMax} />
                    </div>

                    <div className="chart-section glass-strong">
                        <h3 className="section-title">Andamento</h3>
                        <SimpleChart entries={metrics.entries} />
                    </div>
                </>
            )}

            {!metrics && (
                <div className="empty-state">
                    Inserisci la tua prima pesata
                </div>
            )}
        </div>
    );
}

/* =========================
   Components
========================= */

function Metric({ label, value, unit = 'kg' }) {
    return (
        <div className="metric-card glass">
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            <div className="metric-unit">{unit}</div>
        </div>
    );
}

function SimpleChart({ entries }) {
    if (entries.length === 0) return null;

    const pesi = entries.map(([_, data]) => data.peso);
    const min = Math.min(...pesi);
    const max = Math.max(...pesi);
    const range = max - min || 1;

    return (
        <div className="simple-chart">
            {entries.map(([date, data]) => {
                const height = Math.max(((data.peso - min) / range) * 100, 5);
                return (
                    <div key={date} className="chart-bar-container">
                        <div className="chart-bar">
                            <div
                                className="chart-bar-fill"
                                style={{ height: `${height}%` }}
                            />
                        </div>
                        <div className="chart-label">
                            {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
                        </div>
                        <div className="chart-value">{data.peso}</div>
                    </div>
                );
            })}
        </div>
    );
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
}

export default WeightPage;
