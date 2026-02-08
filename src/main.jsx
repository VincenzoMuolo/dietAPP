import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ShoppingPage from './pages/ShoppingPage';
import WeightPage from './pages/WeightPage';
import CadPage from './pages/CadPage';
import Navigation from './components/Navigation';
import CadModal from './components/CadModal';
import NotesModal from './components/NotesModal';
import { getDayOfWeek, getWeeksSinceStart } from './utils/Utils';
import './style.css'

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [currentWeek, setCurrentWeek] = useState(1);
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [modalCad, setModalCad] = useState(null);
    const [showNotes, setShowNotes] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [autoTrackEnabled, setAutoTrackEnabled] = useState(false);
    const [trackingStartDate, setTrackingStartDate] = useState(null);
    const [trackingStartWeek, setTrackingStartWeek] = useState(1); // ← NUOVO
    const [navVisible, setNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const [dietState, setDietState] = useState(null);
    const [cadState, setCadState] = useState(null);
    const [notesState, setNotesState] = useState(null);
    const [productList, setProductList] = useState(null);

    // Load data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [d, c, n, s] = await Promise.all([
                    fetch('/dieta.json').then(r => r.json()),
                    fetch('/codici_piatti.json').then(r => r.json()),
                    fetch('/note_generali.json').then(r => r.json()),
                    fetch('/alimenti_settimanali.json').then(r => r.json())
                ]);
                setDietState(d);
                setCadState(c);
                setNotesState(n);
                setProductList(s);
                setLoaded(true);
            } catch (error) {
                console.error('Error loading JSON data:', error);
                setLoaded(true);
            }
        };
        fetchData();
    }, []);

    // Navbar auto-hide on scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY === 0) {
                setNavVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setNavVisible(false);
            } else if (currentScrollY < lastScrollY) {
                setNavVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Load tracking settings from localStorage
    useEffect(() => {
        const savedAutoTrack = localStorage.getItem('autoTrackEnabled');
        const savedStartDate = localStorage.getItem('trackingStartDate');
        const savedStartWeek = localStorage.getItem('trackingStartWeek'); // ← NUOVO
        
        if (savedAutoTrack === 'true') {
            setAutoTrackEnabled(true);
            setTrackingStartDate(savedStartDate);
            
            // ← NUOVO: Ripristina la settimana salvata
            if (savedStartWeek) {
                const weekNum = Number(savedStartWeek);
                setTrackingStartWeek(weekNum);
                setCurrentWeek(weekNum);
            }
        }
    }, []);

    // Auto-track day changes
    useEffect(() => {
        if (autoTrackEnabled && trackingStartDate && dietState && loaded) {
            const currentDay = getDayOfWeek();
            
            // ← MODIFICATO: Usa trackingStartWeek invece di calcolare
            const days = Object.keys(dietState.piano_alimentare[`settimana_${trackingStartWeek}`]);
            const dayIdx = days.indexOf(currentDay);
            
            if (dayIdx !== -1) {
                setCurrentWeek(trackingStartWeek); // ← Usa settimana di partenza
                setCurrentDayIndex(dayIdx);
            }
        }
    }, [autoTrackEnabled, trackingStartDate, trackingStartWeek, dietState, loaded]);

    // ← MODIFICATO: Accetta parametro startWeek
    const enableAutoTracking = (startWeek = 1) => {
        const startDate = new Date().toISOString();
        setAutoTrackEnabled(true);
        setTrackingStartDate(startDate);
        setTrackingStartWeek(startWeek); // ← NUOVO
        
        localStorage.setItem('autoTrackEnabled', 'true');
        localStorage.setItem('trackingStartDate', startDate);
        localStorage.setItem('trackingStartWeek', startWeek.toString()); // ← NUOVO
        
        if (dietState) {
            const currentDay = getDayOfWeek();
            const days = Object.keys(dietState.piano_alimentare[`settimana_${startWeek}`]); // ← Usa settimana scelta
            const dayIdx = days.indexOf(currentDay);
            if (dayIdx !== -1) {
                setCurrentWeek(startWeek); // ← Imposta settimana scelta
                setCurrentDayIndex(dayIdx);
            }
        }
    };

    const resetAutoTracking = () => {
        setAutoTrackEnabled(false);
        setTrackingStartDate(null);
        setTrackingStartWeek(1); // ← NUOVO: Reset anche settimana
        
        localStorage.removeItem('autoTrackEnabled');
        localStorage.removeItem('trackingStartDate');
        localStorage.removeItem('trackingStartWeek'); // ← NUOVO
        
        setCurrentWeek(1);
        setCurrentDayIndex(0);
    };

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

    const getCadByCode = (code) => {
        if (!code || !cadState) return null;
        const normalized = code.startsWith('CAD:') ? code : `CAD:${code}`;
        return cadState.codici_alimentari.find(c => c.codice === normalized) || null;
    };

    const isCurrentDay = () => {
        if (!autoTrackEnabled) return false;
        const currentDay = getDayOfWeek();
        const currentDayKey = days[currentDayIndex];
        
        // ← MODIFICATO: Confronta con trackingStartWeek
        return trackingStartWeek === currentWeek && currentDay === currentDayKey;
    };

    return (
        <>
            <Header onInfoClick={() => setShowNotes(true)} />

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
                    isCurrentDay={isCurrentDay()}
                />
            )}

            {currentPage === 'shopping' && <ShoppingPage dietData={dietState} productList={productList} />}
            {currentPage === 'cad' && <CadPage cadData={cadState} setModalCad={setModalCad} />}
            {currentPage === 'weight' && <WeightPage />}
            <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} navVisible={navVisible} />

            {modalCad && (
                <CadModal cad={modalCad} onClose={() => setModalCad(null)} />
            )}

            {showNotes && (
                <NotesModal 
                    notesData={notesState} 
                    onClose={() => setShowNotes(false)}
                    autoTrackEnabled={autoTrackEnabled}
                    onEnableTracking={enableAutoTracking}
                    onResetTracking={resetAutoTracking}
                />
            )}
        </>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />)