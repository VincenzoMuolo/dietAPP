import React, { useState, useEffect } from 'react';

function WeightPage() {
    const [pesate, setPesate] = useState({});
    const [peso, setPeso] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [timeframe, setTimeframe] = useState('settimana');

    const today = new Date().toISOString().split('T')[0];

    // Carica pesate da KV
    useEffect(() => {
        loadPesate();
    }, []);

    const loadPesate = async () => {
        try {
            const response = await fetch('/api/pesate');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            setPesate(data);
        } catch (error) {
            console.error('Errore caricamento pesate:', error);
            // Fallback a localStorage se KV non disponibile
            try {
                const saved = localStorage.getItem('pesate_backup');
                if (saved) {
                    setPesate(JSON.parse(saved));
                }
            } catch (e) {
                console.error('Errore localStorage:', e);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!peso) return;

        setSaving(true);
        try {
            const response = await fetch('/api/pesate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: today,
                    peso: parseFloat(peso),
                    note: ''
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            
            // Aggiorna stato locale
            await loadPesate();
            
            // Backup locale
            localStorage.setItem('pesate_backup', JSON.stringify(result.pesate || pesate));
            
            setPeso('');
            alert('✅ Pesata salvata!');
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('❌ Errore: impossibile salvare. Verifica la connessione.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (date) => {
        if (!window.confirm('Vuoi eliminare questa pesata?')) return;

        try {
            const response = await fetch('/api/pesate', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await loadPesate();
        } catch (error) {
            console.error('Errore eliminazione:', error);
            alert('❌ Errore: impossibile eliminare.');
        }
    };

    // Calcolo metriche
    const getMetrics = () => {
        const entries = Object.entries(pesate).sort((a, b) => a[0].localeCompare(b[0]));
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
            filteredEntries = entries.filter(([date]) => new Date(date) >= weekAgo);
        } else if (timeframe === 'mese') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filteredEntries = entries.filter(([date]) => new Date(date) >= monthAgo);
        }

        const filteredPesi = filteredEntries.map(([_, data]) => data.peso);
        const pesoMin = Math.min(...filteredPesi);
        const pesoMax = Math.max(...filteredPesi);
        const media = (filteredPesi.reduce((a, b) => a + b, 0) / filteredPesi.length).toFixed(1);

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

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
                    Caricamento...
                </div>
            </div>
        );
    }

    return (
        <div className="container weight-container">
            {/* INPUT RAPIDO */}
            <div className="weight-input-card glass-strong">
                <div className="date-display">
                    <div className="date-label">OGGI</div>
                    <div className="date-value">{formatDate(today)}</div>
                </div>

                {todayPesata ? (
                    <div className="peso-salvato">
                        <div className="peso-salvato-value">{todayPesata.peso} kg</div>
                        <button className="delete-btn-mini" onClick={() => handleDelete(today)}>
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
                        <button type="submit" className="save-btn-mini" disabled={saving}>
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
                        <div className="metric-card glass">
                            <div className="metric-label">Attuale</div>
                            <div className="metric-value">{metrics.pesoAttuale}</div>
                            <div className="metric-unit">kg</div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Variazione</div>
                            <div className={`metric-value ${metrics.differenza < 0 ? 'positive' : 'negative'}`}>
                                {metrics.differenza > 0 ? '+' : ''}{metrics.differenza.toFixed(1)}
                            </div>
                            <div className="metric-unit">kg</div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Progresso</div>
                            <div className={`metric-value ${metrics.percentuale < 0 ? 'positive' : 'negative'}`}>
                                {metrics.percentuale > 0 ? '+' : ''}{metrics.percentuale}
                            </div>
                            <div className="metric-unit">%</div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Media</div>
                            <div className="metric-value">{metrics.media}</div>
                            <div className="metric-unit">kg</div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Min</div>
                            <div className="metric-value">{metrics.pesoMin}</div>
                            <div className="metric-unit">kg</div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Max</div>
                            <div className="metric-value">{metrics.pesoMax}</div>
                            <div className="metric-unit">kg</div>
                        </div>
                    </div>

                    {/* GRAFICO */}
                    <div className="chart-section glass-strong">
                        <h3 className="section-title">Andamento</h3>
                        <SimpleChart entries={metrics.entries} />
                    </div>

                    {/* STORICO */}
                    {Object.keys(pesate).length > 0 && (
                        <div className="history-section">
                            <h3 className="section-title">Storico</h3>
                            {Object.entries(pesate)
                                .sort((a, b) => b[0].localeCompare(a[0]))
                                .map(([date, data]) => (
                                    <div key={date} className="history-item">
                                        <div className="history-date">{formatDate(date)}</div>
                                        <div className="history-peso">{data.peso} kg</div>
                                        {date !== today && (
                                            <button
                                                className="delete-btn-tiny"
                                                onClick={() => handleDelete(date)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </>
            )}

            {!metrics && (
                <div className="empty-state">
                    Inserisci la tua prima pesata per vedere le metriche
                </div>
            )}
        </div>
    );
}

// Grafico semplice
function SimpleChart({ entries }) {
    if (entries.length === 0) return <div className="empty-state">Nessun dato</div>;

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
    const date = new Date(dateStr);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('it-IT', options);
}

export default WeightPage;
