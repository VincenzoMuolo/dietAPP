import React, { useState, useEffect } from 'react';
import { getDayName, getMealName, isPreparedDish, getCurrentMealTime, isPastMeal } from '../utils/Utils';
import { ChevronDownIcon, ArrowLeft, ArrowRight} from '../utils/Icons';

function HomePage({ dietData, currentWeek, currentDayIndex, days, goToPreviousDay, goToNextDay, canGoPrevious, canGoNext, setModalCad, getCadByCode, isCurrentDay }) {
    const currentDayKey = days[currentDayIndex];
    const dayData = dietData.piano_alimentare[`settimana_${currentWeek}`][currentDayKey];
    const [expandedMeals, setExpandedMeals] = useState({});

    useEffect(() => {
        if (isCurrentDay) {
            const currentMeal = getCurrentMealTime();
            const initialExpanded = {};
            
            Object.keys(dayData).forEach(mealKey => {
                // Se è la sezione speciale, la teniamo sempre aperta
                if (mealKey === 'nell_arco_della_giornata') {
                    initialExpanded[mealKey] = true;
                } else if (mealKey === currentMeal) {
                    initialExpanded[mealKey] = true;
                } else {
                    initialExpanded[mealKey] = false;
                }
            });
            
            setExpandedMeals(initialExpanded);
        } else {
            const allStates = {};
            Object.keys(dayData).forEach(mealKey => {
                // Anche negli altri giorni, questa sezione resta aperta
                allStates[mealKey] = mealKey === 'nell_arco_della_giornata';
            });
            setExpandedMeals(allStates);
        }
    }, [currentDayKey, currentWeek, isCurrentDay, dayData]);

    const toggleMeal = (mealKey) => {
        // Impediamo il toggle se è la sezione speciale
        if (mealKey === 'nell_arco_della_giornata') return;

        setExpandedMeals(prev => ({
            ...prev,
            [mealKey]: !prev[mealKey]
        }));
    };

    return (
        <div className="container">
            <div className="day-selector glass">
                <button className="arrow-btn" onClick={goToPreviousDay} disabled={!canGoPrevious}>
                    <ArrowLeft/>
                </button>
                <div className="day-info">
                    <div className="day-name">{getDayName(currentDayKey)}</div>
                    <div className="week-info">Settimana {currentWeek}</div>
                </div>
                <button className="arrow-btn" onClick={goToNextDay} disabled={!canGoNext}>
                    <ArrowRight/>
                </button>
            </div>

            {Object.entries(dayData).map(([mealKey, foods]) => {
                const isSpecialMeal = mealKey === 'nell_arco_della_giornata';
                const isExpanded = isSpecialMeal ? true : (expandedMeals[mealKey] || false);
                const isCurrent = isCurrentDay && mealKey === getCurrentMealTime();
                
                return (
                    <div key={mealKey} className="meal-section">
                        <div 
                            className={`meal-header 
                                ${isExpanded ? 'expanded' : ''} 
                                ${isCurrent ? 'current' : ''} 
                                ${isSpecialMeal ? 'static-header' : ''}`}
                            // Rimuoviamo la funzione di click se è special
                            onClick={isSpecialMeal ? null : () => toggleMeal(mealKey)}
                            style={isSpecialMeal ? { cursor: 'default' } : {}}
                        >
                            <div className="meal-header-left">
                                {/* Pallino: rimosso se isSpecialMeal */}
                                {!isSpecialMeal && <div className="meal-time-indicator" />}
                                
                                <span className="meal-title">{getMealName(mealKey)}</span>
                            </div>

                            {/* Freccia: rimossa se isSpecialMeal */}
                            {!isSpecialMeal && <ChevronDownIcon />}
                        </div>

                        <div className={`meal-content ${isExpanded ? 'expanded' : ''}`}>
                            <div className="foods-grid">
                                {foods.map((food, idx) => (
                                    <FoodCard key={idx} food={food} setModalCad={setModalCad} getCadByCode={getCadByCode} />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Food Card Component rimane invariato
function FoodCard({ food, setModalCad, getCadByCode }) {
    const showCad = isPreparedDish(food) && food.cad;

    return (
        <div className="food-card glass">
            <div className="food-name">{food.alimento}</div>
            {food.quantita && <div className="food-quantity">{food.quantita}</div>}
            {showCad && (
                <span className="cad-badge" onClick={() => setModalCad(getCadByCode(food.cad))}>
                    CAD:{food.cad}
                </span>
            )}
            {food.composizione && (
                <div className="composition">
                    {food.composizione.map((item, idx) => (
                        <div key={idx} className="composition-item">
                            • {item.alimento} - {item.quantita}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HomePage;