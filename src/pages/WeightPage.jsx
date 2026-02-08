import React, { useState, useEffect } from 'react';

function WeightPage() {
    const [pesate, setPesate] = useState({});
    const [peso, setPeso] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState('input'); // 'input' | 'metriche'
    const [timeframe, setTimeframe] = useState('settimana'); // 'settimana' | 'mese' | 'tutto'

    const today = new Date().toISOString().split('T')[0];

    // Carica pesate da KV
    useEffect(() => {
        loadPesate();
    }, []);

    const loadPesate = async () => {
        try {
            const response = await fetch('/api/pesate');
            const data = await response.json();
            setPesate(data);
        } catch (error) {
            console.error('Errore caricamento pesate:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!peso) return;

        setSaving(true);
        try {
            await fetch('/api/pesate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: today,
                    peso: parseFloat(peso),
                    note
                })
            });

            // Ricarica dati
            await loadPesate();
            setPeso('');
            setNote('');
            alert('Pesata salvata!');
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (date) => {
        if (!window.confirm('Vuoi eliminare questa pesata?')) return;

        try {
            await fetch('/api/pesate', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date })
            });
            await loadPesate();
        } catch (error) {
            console.error('Errore eliminazione:', error);
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

        // Filtra per timeframe
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
        <div className="container">
            {/* TABS */}
            <div className="pesate-tabs">
                <button 
                    className={`tab-btn ${view === 'input' ? 'active' : ''}`}
                    onClick={() => setView('input')}
                >
                    INSERISCI
                </button>
                <button 
                    className={`tab-btn ${view === 'metriche' ? 'active' : ''}`}
                    onClick={() => setView('metriche')}
                >
                    METRICHE
                </button>
            </div>

            {/* INPUT VIEW */}
            {view === 'input' && (
                <div className="pesate-input-section">
                    <div className="date-display">
                        <div className="date-label">Oggi</div>
                        <div className="date-value">{formatDate(today)}</div>
                    </div>

                    {todayPesata ? (
                        <div className="pesata-saved glass">
                            <div className="saved-icon">✓</div>
                            <div className="saved-info">
                                <div className="saved-label">Pesata registrata</div>
                                <div className="saved-peso">{todayPesata.peso} kg</div>
                                {todayPesata.note && (
                                    <div className="saved-note">{todayPesata.note}</div>
                                )}
                            </div>
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(today)}
                            >
                                🗑️
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="pesata-form glass-strong">
                            <div className="form-group">
                                <label className="form-label">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={peso}
                                    onChange={(e) => setPeso(e.target.value)}
                                    placeholder="Es: 99.9"
                                    required
                                    autoFocus
                                    className='pesata-form-input'
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Note (opzionale)</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="boh"
                                    className='pesata-form-input'
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="save-btn"
                                disabled={saving}
                            >
                                {saving ? 'Salvataggio...' : 'SALVA'}
                            </button>
                        </form>
                    )}

                    {/* Storico recente */}
                    <div className="recent-history">
                        <h3 className="section-title">Ultime Pesate</h3>
                        {Object.entries(pesate)
                            .sort((a, b) => b[0].localeCompare(a[0]))
                            .slice(0, 5)
                            .map(([date, data]) => (
                                <div key={date} className="history-item">
                                    <div className="history-date">{formatDate(date)}</div>
                                    <div className="history-peso">{data.peso} kg</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* METRICHE VIEW */}
            {view === 'metriche' && metrics && (
                <div className="metriche-section">
                    {/* Timeframe selector */}
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

                    {/* Cards metriche */}
                    <div className="metrics-grid">
                        <div className="metric-card glass">
                            <div className="metric-label">Peso Attuale</div>
                            <div className="metric-value">{metrics.pesoAttuale} kg</div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Variazione</div>
                            <div className={`metric-value ${metrics.differenza < 0 ? 'positive' : 'negative'}`}>
                                {metrics.differenza > 0 ? '+' : ''}{metrics.differenza.toFixed(1)} kg
                            </div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Progresso</div>
                            <div className={`metric-value ${metrics.percentuale < 0 ? 'positive' : 'negative'}`}>
                                {metrics.percentuale > 0 ? '+' : ''}{metrics.percentuale}%
                            </div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Media Periodo</div>
                            <div className="metric-value">{metrics.media} kg</div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Minimo</div>
                            <div className="metric-value">{metrics.pesoMin} kg</div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-label">Massimo</div>
                            <div className="metric-value">{metrics.pesoMax} kg</div>
                        </div>
                    </div>

                    {/* Grafico semplice */}
                    <div className="chart-section glass-strong">
                        <h3 className="section-title">Andamento</h3>
                        <SimpleChart entries={metrics.entries} />
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente grafico semplice
function SimpleChart({ entries }) {
    if (entries.length === 0) return <div>Nessun dato disponibile</div>;

    const pesi = entries.map(([_, data]) => data.peso);
    const min = Math.min(...pesi);
    const max = Math.max(...pesi);
    const range = max - min || 1;

    return (
        <div className="simple-chart">
            {entries.map(([date, data], idx) => {
                const height = ((data.peso - min) / range) * 100;
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

// Utility
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('it-IT', options);
}

export default WeightPage;
