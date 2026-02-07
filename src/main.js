import './style.css'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

// Utility functions
const getDayName = (dayKey) => {
    const names = {
        lunedi: 'Lunedì',
        martedi: 'Martedì',
        mercoledi: 'Mercoledì',
        giovedi: 'Giovedì',
        venerdi: 'Venerdì',
        sabato: 'Sabato',
        domenica: 'Domenica'
    };
    return names[dayKey] || dayKey;
};

const getMealName = (mealKey) => {
    const names = {
        colazione: 'Colazione',
        spuntino_meta_mattina: 'Spuntino',
        pranzo: 'Pranzo',
        merenda: 'Merenda',
        cena: 'Cena',
        nell_arco_della_giornata: "Nell'arco della giornata"
    };
    return names[mealKey] || mealKey;
};

// Main App Component
function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [currentWeek, setCurrentWeek] = useState(1);
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [modalCad, setModalCad] = useState(null);
    const [loaded, setLoaded] = useState(false);

    // State for fetched data
    const [dietState, setDietState] = useState(null);
    const [cadState, setCadState] = useState(null);
    const [notesState, setNotesState] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [d, c, n] = await Promise.all([
                    fetch('/dieta.json').then(r => r.json()),
                    fetch('/codici_piatti.json').then(r => r.json()),
                    fetch('/note_generali.json').then(r => r.json())
                ]);
                setDietState(d);
                setCadState(c);
                setNotesState(n);
                setLoaded(true);
            } catch (error) {
                console.error('Error loading JSON data:', error);
                setLoaded(true);
            }
        };
        fetchData();
    }, []);

    if (!loaded || !dietState || !cadState || !notesState) {
        return <div className="loading">Caricamento dati...</div>;
    }

    const weeks = Object.keys(dietState.piano_alimentare);
    const days = Object.keys(dietState.piano_alimentare[`settimana_${currentWeek}`]);

    const goToPreviousDay = () => {
        if (currentDayIndex > 0) {
            setCurrentDayIndex(currentDayIndex - 1);
        } else if (currentWeek > 1) {
            setCurrentWeek(currentWeek - 1);
            setCurrentDayIndex(6);
        }
    };

    const goToNextDay = () => {
        if (currentDayIndex < days.length - 1) {
            setCurrentDayIndex(currentDayIndex + 1);
        } else if (currentWeek < weeks.length) {
            setCurrentWeek(currentWeek + 1);
            setCurrentDayIndex(0);
        }
    };

    const canGoPrevious = currentWeek > 1 || currentDayIndex > 0;
    const canGoNext = currentWeek < weeks.length || currentDayIndex < days.length - 1;

    // Helper function to get CAD by code
    const getCadByCode = (code) => {
        if (!code || !cadState) return null;
        const normalized = code.startsWith('CAD:') ? code : `CAD:${code}`;
        return cadState.codici_alimentari.find(c => c.codice === normalized) || null;
    };

    return (
        <>
            <div className="header glass-strong">
                <h1>DietAPP</h1>
            </div>

            {currentPage === 'home' && (
                <HomePage
                    dietData={dietState}
                    currentWeek={currentWeek}
                    currentDayIndex={currentDayIndex}
                    days={days}
                    goToPreviousDay={goToPreviousDay}
                    goToNextDay={goToNextDay}
                    canGoPrevious={canGoPrevious}
                    canGoNext={canGoNext}
                    setModalCad={setModalCad}
                    getCadByCode={getCadByCode}
                />
            )}

            {currentPage === 'notes' && <NotesPage notesData={notesState} />}
            {currentPage === 'query' && <QueryPage dietData={dietState} />}
            {currentPage === 'cad' && <CadPage cadData={cadState} setModalCad={setModalCad} />}

            <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

            {modalCad && (
                <CadModal cad={modalCad} onClose={() => setModalCad(null)} />
            )}
        </>
    );
}

// Home Page Component
function HomePage({ dietData, currentWeek, currentDayIndex, days, goToPreviousDay, goToNextDay, canGoPrevious, canGoNext, setModalCad, getCadByCode }) {
    const currentDayKey = days[currentDayIndex];
    const dayData = dietData.piano_alimentare[`settimana_${currentWeek}`][currentDayKey];

    return (
        <div className="container">
            <div className="day-selector glass">
                <button className="arrow-btn" onClick={goToPreviousDay} disabled={!canGoPrevious}>
                    ◀
                </button>
                <div className="day-info">
                    <div className="day-name">{getDayName(currentDayKey)}</div>
                    <div className="week-info">Settimana {currentWeek}</div>
                </div>
                <button className="arrow-btn" onClick={goToNextDay} disabled={!canGoNext}>
                    ▶
                </button>
            </div>

            {Object.entries(dayData).map(([mealKey, foods]) => (
                <div key={mealKey} className="meal-section">
                    <div className="meal-title">{getMealName(mealKey)}</div>
                    {foods.map((food, idx) => (
                        <FoodCard key={idx} food={food} setModalCad={setModalCad} getCadByCode={getCadByCode} />
                    ))}
                </div>
            ))}
        </div>
    );
}

// Food Card Component
function FoodCard({ food, setModalCad, getCadByCode }) {
    return (
        <div className="food-card glass">
            <div className="food-name">{food.alimento}</div>
            {food.quantita && <div className="food-quantity">{food.quantita}</div>}
            {food.cad && (
                <span className="cad-badge" onClick={() => setModalCad(getCadByCode(food.cad))}>
                    CAD:{food.cad}
                </span>
            )}
            {food.composizione && (
                <div className="composition">
                    {food.composizione.map((item, idx) => (
                        <div key={idx} className="composition-item">
                            • {item.alimento} - {item.quantita}
                            {item.cad && (
                                <span className="cad-badge" onClick={() => setModalCad(getCadByCode(item.cad))}>
                                    CAD:{item.cad}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Notes Page Component
function NotesPage({ notesData }) {
    return (
        <div className="notes-section">
            <div className="note-category">
                <h2>Norme Generali</h2>
                <div className="note-item glass">
                    <strong>Comportamenti da evitare:</strong>
                    <ul className="note-list">
                        {notesData.norme_generali.comportamenti_da_evitare.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="note-item glass">
                    <strong>Metodi di cottura - Carne e Pesce:</strong>
                    <ul className="note-list">
                        {notesData.norme_generali.metodi_di_cottura.carne_e_pesce.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="note-item glass">
                    <strong>Acqua:</strong>
                    <p>{notesData.norme_generali.acqua.tipo || 'Bere almeno 1-1.5 litri al giorno'}</p>
                </div>
            </div>

            <div className="note-category">
                <h2>Pesi e Misure</h2>
                <div className="note-item glass">
                    <strong>Pesatura:</strong>
                    <p>{notesData.pesi_e_misure.peso_alimenti.momento_pesatura}</p>
                    <ul className="note-list">
                        {notesData.pesi_e_misure.peso_alimenti.esempi_parte_edibile?.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="note-item glass">
                    <strong>Approssimazione:</strong>
                    <p>{notesData.pesi_e_misure.approssimazione.avvertenza}</p>
                </div>
            </div>
        </div>
    );
}

// Query Page Component
function QueryPage({ dietData }) {
    const [queryType, setQueryType] = useState('day');
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDay, setSelectedDay] = useState('lunedi');
    const [results, setResults] = useState(null);

    const executeQuery = () => {
        let foods = [];

        if (queryType === 'day') {
            const dayData = dietData.piano_alimentare[`settimana_${selectedWeek}`][selectedDay];
            Object.entries(dayData).forEach(([meal, items]) => {
                items.forEach(item => {
                    foods.push({
                        day: getDayName(selectedDay),
                        meal: getMealName(meal),
                        food: item.alimento,
                        quantity: item.quantita
                    });
                });
            });
        } else if (queryType === 'week') {
            const weekData = dietData.piano_alimentare[`settimana_${selectedWeek}`];
            Object.entries(weekData).forEach(([day, dayMeals]) => {
                Object.entries(dayMeals).forEach(([meal, items]) => {
                    items.forEach(item => {
                        foods.push({
                            day: getDayName(day),
                            meal: getMealName(meal),
                            food: item.alimento,
                            quantity: item.quantita
                        });
                    });
                });
            });
        }

        setResults(foods);
    };

    return (
        <div className="query-section">
            <div className="query-controls glass-strong">
                <div className="query-group">
                    <label className="query-label">Tipo di Query</label>
                    <select value={queryType} onChange={(e) => setQueryType(e.target.value)}>
                        <option value="day">Giorno Singolo</option>
                        <option value="week">Settimana Intera</option>
                    </select>
                </div>

                <div className="query-group">
                    <label className="query-label">Settimana</label>
                    <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
                        <option value={1}>Settimana 1</option>
                        <option value={2}>Settimana 2</option>
                        <option value={3}>Settimana 3</option>
                    </select>
                </div>

                {queryType === 'day' && (
                    <div className="query-group">
                        <label className="query-label">Giorno</label>
                        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                            <option value="lunedi">Lunedì</option>
                            <option value="martedi">Martedì</option>
                            <option value="mercoledi">Mercoledì</option>
                            <option value="giovedi">Giovedì</option>
                            <option value="venerdi">Venerdì</option>
                            <option value="sabato">Sabato</option>
                            <option value="domenica">Domenica</option>
                        </select>
                    </div>
                )}

                <button className="query-btn" onClick={executeQuery}>
                    Esegui Query
                </button>
            </div>

            {results && (
                <div className="query-results">
                    {results.map((item, idx) => (
                        <div key={idx} className="result-item glass">
                            <div className="result-day">{item.day} - {item.meal}</div>
                            <div className="result-foods">
                                <div className="result-food-tag">
                                    {item.food} {item.quantity ? `(${item.quantity})` : ''}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// CAD Page Component
function CadPage({ cadData, setModalCad }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCads = (cadData && cadData.codici_alimentari ? cadData.codici_alimentari : []).filter(cad =>
        cad.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cad.codice.includes(searchTerm)
    );

    return (
        <div className="cad-section">
            <div className="cad-search glass">
                <input
                    type="text"
                    placeholder="Cerca per nome o codice CAD..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredCads.map((cad, idx) => (
                <div key={idx} className="cad-card glass-strong" onClick={() => setModalCad(cad)}>
                    <div className="cad-header">
                        <span className="cad-code">{cad.codice}</span>
                    </div>
                    <div className="cad-name">{cad.nome}</div>
                    <div className="cad-description">
                        {cad.descrizione.substring(0, 100)}...
                    </div>
                </div>
            ))}
        </div>
    );
}

// CAD Modal Component
function CadModal({ cad, onClose }) {
    if (!cad) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-strong" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="cad-code" style={{marginBottom: '15px'}}>{cad.codice}</div>
                <div className="cad-name">{cad.nome}</div>
                <div className="cad-description">{cad.descrizione}</div>

                {cad.alternative && cad.alternative.length > 0 && (
                    <div className="alternatives-section">
                        <div className="alternatives-title">Alternative:</div>
                        {cad.alternative.map((alt, idx) => (
                            <div key={idx} className="alternative-item">
                                <div className="alternative-name">{alt.nome}</div>
                                <div className="ingredient-list">
                                    {alt.ingredienti.map((ing, i) => (
                                        <div key={i}>• {ing.nome} - {ing.quantita} {ing.unita}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Navigation Component
function Navigation({ currentPage, setCurrentPage }) {
    return (
        <div className="nav-container">
            <div className="nav-menu glass-strong">
                <button
                    className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('home')}
                >
                    🏠 Piano
                </button>
                <button
                    className={`nav-btn ${currentPage === 'notes' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('notes')}
                >
                    📋 Note
                </button>
                <button
                    className={`nav-btn ${currentPage === 'query' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('query')}
                >
                    🔍 Query
                </button>
                <button
                    className={`nav-btn ${currentPage === 'cad' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('cad')}
                >
                    📖 CAD
                </button>
            </div>
        </div>
    );
}

// Render App
ReactDOM.createRoot(document.getElementById('app')).render(<App />)

