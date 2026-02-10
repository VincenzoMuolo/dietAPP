import React from 'react';
import { getDayName, isPreparedDish } from '../utils/Utils';
import { ArrowLeftIcon, ArrowRightIcon } from '../utils/Icons';

function HomePage({ dietData, currentWeek, currentDayIndex, days, goToPreviousDay, goToNextDay, canGoPrevious, canGoNext, setModalCad, getCadByCode }) {
    const currentDayKey = days[currentDayIndex];
    const dayData = dietData.piano_alimentare[`settimana_${currentWeek}`][currentDayKey];

    // Funzione per combinare zucchero con caffè/cappuccino
    const combineFoodsWithSugar = (foods) => {
        const combined = [];
        let skipNext = false;

        for (let i = 0; i < foods.length; i++) {
            if (skipNext) {
                skipNext = false;
                continue;
            }

            const currentFood = foods[i];
            const nextFood = foods[i + 1];
            const currentName = currentFood.alimento.toLowerCase();
            
            // Se è caffè o cappuccino e il prossimo è zucchero, combinali
            if ((currentName.includes('caffè') || currentName.includes('caffe') || currentName.includes('cappuccino')) && 
                nextFood && nextFood.alimento.toLowerCase().includes('zucchero')) {
                
                combined.push({
                    ...currentFood,
                    sugar: nextFood.quantita
                });
                skipNext = true;
            } else {
                // Skip standalone sugar items
                if (!currentName.includes('zucchero')) {
                    combined.push(currentFood);
                }
            }
        }

        return combined;
    };

    return (
        <div className="container">
            {/* HEADER NAVIGAZIONE */}
            <div className="day-selector">
                <div 
                    className="day-arrow" 
                    onClick={!canGoPrevious ? null : goToPreviousDay}
                    style={{
                        opacity: canGoPrevious ? 1 : 0.2,
                        cursor: canGoPrevious ? 'pointer' : 'not-allowed'
                    }}
                >
                    <ArrowLeftIcon />
                </div>
                
                <div className="date-info">
                    <div className="day-name">{getDayName(currentDayKey)}</div>
                    <div className="week-badge">Settimana {currentWeek}</div>
                </div>
                
                <div 
                    className="day-arrow"
                    onClick={!canGoNext ? null : goToNextDay}
                    style={{
                        opacity: canGoNext ? 1 : 0.2,
                        cursor: canGoNext ? 'pointer' : 'not-allowed'
                    }}
                >
                    <ArrowRightIcon />
                </div>
            </div>

            {/* MEAL SECTIONS */}
            {Object.entries(dayData).map(([mealKey, foods]) => {
                const isDaily = mealKey === 'nell_arco_della_giornata';
                const processedFoods = combineFoodsWithSugar(foods);
                
                return (
                    <div key={mealKey} className={`meal-section`}>
                        <div className="meal-header-flat">
                            {getMealLabel(mealKey)}
                        </div>
                        
                        <ul className="food-list-flat">
                            {processedFoods.map((food, idx) => (
                                <FoodItem 
                                    key={idx} 
                                    food={food} 
                                    setModalCad={setModalCad} 
                                    getCadByCode={getCadByCode} 
                                />
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}

// Converti chiave pasto in label
function getMealLabel(mealKey) {
    const labels = {
        'colazione': 'COLAZIONE',
        'spuntino_meta_mattina': 'SPUNTINO',
        'pranzo': 'PRANZO',
        'merenda': 'MERENDA',
        'cena': 'CENA',
        'nell_arco_della_giornata': 'NELL\'ARCO DELLA GIORNATA'
    };
    return labels[mealKey] || mealKey.toUpperCase();
}

// Componente singolo alimento
function FoodItem({ food, setModalCad, getCadByCode }) {
    const showCad = isPreparedDish(food) && food.cad;
    const handleClick = showCad ? () => setModalCad(getCadByCode(food.cad)) : null;

    return (
        <li className="food-item-flat" onClick={handleClick}>
            <div className="food-left">
                <div className="food-name-flat">
                    {food.alimento}
                    {food.sugar && ` + Zucchero (${food.sugar})`}
                    {showCad && (
                        <span className="food-cad-badge">CAD:{food.cad}</span>
                    )}
                </div>
                
                {food.composizione && (
                    <div className="food-ingredients-flat">
                        {food.composizione.map((item, idx) => (
                            <div key={idx} className="ingredient-line-flat">
                                <span>{item.alimento}</span>
                                <span className="ingredient-qty-flat">{item.quantita}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {food.quantita && !food.composizione && (
                <div className="food-quantity-flat">{food.quantita}</div>
            )}
        </li>
    );
}

export default HomePage;
