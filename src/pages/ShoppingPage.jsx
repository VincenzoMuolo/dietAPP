import React, { useState, useEffect } from 'react';
import { getDayName } from '../utils/Utils';

function ShoppingPage({ dietData, productList }) {
    const [shoppingType, setShoppingType] = useState('day');
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDay, setSelectedDay] = useState('lunedi');
    const [startDay, setStartDay] = useState('lunedi');
    const [endDay, setEndDay] = useState('domenica');
    const [results, setResults] = useState(null);
    const [checkedItems, setCheckedItems] = useState(new Set());
    const [currentTab, setCurrentTab] = useState('todo');
    const [controlsCollapsed, setControlsCollapsed] = useState(false);
    const [listKey, setListKey] = useState('');

    const dayOptions = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];

    useEffect(() => {
        const savedList = localStorage.getItem('shoppingList');
        const savedChecked = localStorage.getItem('shoppingChecked');
        const savedListKey = localStorage.getItem('shoppingListKey');
        const savedTab = localStorage.getItem('shoppingTab');

        if (savedList && savedChecked && savedListKey) {
            setResults(JSON.parse(savedList));
            setCheckedItems(new Set(JSON.parse(savedChecked)));
            setListKey(savedListKey);
            setCurrentTab(savedTab || 'todo');
            setControlsCollapsed(true);
        }
    }, []);

    useEffect(() => {
        if (results) {
            localStorage.setItem('shoppingList', JSON.stringify(results));
            localStorage.setItem('shoppingChecked', JSON.stringify([...checkedItems]));
            localStorage.setItem('shoppingListKey', listKey);
            localStorage.setItem('shoppingTab', currentTab);
        }
    }, [results, checkedItems, listKey, currentTab]);

    const shouldSkipItem = (itemName) => {
        const lowerName = itemName.toLowerCase();
        return (
            lowerName.includes('pasto libero') ||
            lowerName.includes('caffè') ||
            lowerName.includes('caffe') ||
            lowerName.includes('cappuccino') ||
            lowerName.includes('zucchero')
        );
    };

    const extractFromDietData = (targetDays) => {
        if (!dietData) return {};

        const weekKey = `settimana_${selectedWeek}`;
        const weekData = dietData.piano_alimentare[weekKey];
        if (!weekData) return {};

        const aggregated = {};

        targetDays.forEach(day => {
            const dayMeals = weekData[day];
            if (!dayMeals) return;

            Object.values(dayMeals).forEach(foods => {
                foods.forEach(food => {
                    if (shouldSkipItem(food.alimento)) return;

                    if (food.composizione && food.composizione.length > 0) {
                        food.composizione.forEach(ingredient => {
                            const name = ingredient.alimento.toLowerCase();
                            const quantity = ingredient.quantita;

                            if (!aggregated[name]) {
                                aggregated[name] = {
                                    name: ingredient.alimento,
                                    rawQuantities: []
                                };
                            }

                            aggregated[name].rawQuantities.push(quantity);
                        });
                    } else {
                        const name = food.alimento.toLowerCase();
                        const quantity = food.quantita;

                        if (!aggregated[name]) {
                            aggregated[name] = {
                                name: food.alimento,
                                rawQuantities: []
                            };
                        }

                        if (quantity) {
                            aggregated[name].rawQuantities.push(quantity);
                        }
                    }
                });
            });
        });

        Object.keys(aggregated).forEach(key => {
            const item = aggregated[key];
            item.quantities = parseAndAggregateQuantities(item.rawQuantities);
            delete item.rawQuantities;
        });

        return aggregated;
    };

    const parseAndAggregateQuantities = (quantityStrings) => {
        const quantities = {};

        quantityStrings.forEach(qtyStr => {
            if (!qtyStr) return;

            const str = qtyStr.toLowerCase();

            const gramMatch = str.match(/(\d+)\s*g/);
            if (gramMatch) {
                quantities.g = (quantities.g || 0) + parseInt(gramMatch[1]);
                return;
            }

            const pieceMatch = str.match(/n°?\s*(\d+)|(\d+)\s*pz/);
            if (pieceMatch) {
                const val = parseInt(pieceMatch[1] || pieceMatch[2]);
                quantities.pz = (quantities.pz || 0) + val;
                return;
            }

            const cupMatch = str.match(/(\d+)\s*tazzin/);
            if (cupMatch) {
                quantities['tazz.'] = (quantities['tazz.'] || 0) + parseInt(cupMatch[1]);
                return;
            }

            const spoonMatch = str.match(/(\d+)\s*cucchiai/);
            if (spoonMatch) {
                quantities['cucchiaini'] = (quantities['cucchiaini'] || 0) + parseInt(spoonMatch[1]);
                return;
            }

            const fractionMatch = str.match(/(\d+)\/(\d+)/);
            if (fractionMatch) {
                const num = parseInt(fractionMatch[1]);
                const den = parseInt(fractionMatch[2]);
                const value = num / den;
                
                if (str.includes('cucchiai')) {
                    quantities['cucchiaini'] = (quantities['cucchiaini'] || 0) + value;
                }
                return;
            }
        });

        return quantities;
    };

    const extractFromProductList = () => {
        if (!productList) return {};

        const weekKey = `settimana_${selectedWeek}`;
        const weekData = productList[weekKey];
        if (!weekData) return {};

        const aggregated = {};

        Object.values(weekData).forEach(categoryArray => {
            if (!Array.isArray(categoryArray)) return;
            
            categoryArray.forEach(item => {
                if (shouldSkipItem(item.alimento)) return;

                const name = item.alimento.toLowerCase();

                if (!aggregated[name]) {
                    aggregated[name] = {
                        name: item.alimento,
                        quantities: {}
                    };
                }

                if (item.quantita_g !== undefined) {
                    aggregated[name].quantities.g = (aggregated[name].quantities.g || 0) + item.quantita_g;
                }
                if (item.quantita_n !== undefined) {
                    aggregated[name].quantities.pz = (aggregated[name].quantities.pz || 0) + item.quantita_n;
                }
                if (item.quantita_tazzine !== undefined) {
                    aggregated[name].quantities['tazz.'] = (aggregated[name].quantities['tazz.'] || 0) + item.quantita_tazzine;
                }
            });
        });

        return aggregated;
    };

    const generateShoppingList = () => {
        let targetDays = [];
        if (shoppingType === 'day') {
            targetDays = [selectedDay];
        } else if (shoppingType === 'range') {
            const startIdx = dayOptions.indexOf(startDay);
            const endIdx = dayOptions.indexOf(endDay);
            targetDays = dayOptions.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);
        } else {
            targetDays = dayOptions;
        }

        let aggregated;

        if (shoppingType === 'week') {
            aggregated = extractFromProductList();
        } else {
            aggregated = extractFromDietData(targetDays);
        }

        const resultArray = Object.values(aggregated)
            .filter(item => Object.keys(item.quantities).length > 0)
            .sort((a, b) => a.name.localeCompare(b.name));

        const key = shoppingType === 'day' 
            ? `${selectedDay}-W${selectedWeek}`
            : shoppingType === 'range'
            ? `${startDay}-${endDay}-W${selectedWeek}`
            : `week-${selectedWeek}`;

        setListKey(key);
        setResults(resultArray);
        setCheckedItems(new Set());
        setCurrentTab('todo');
        setControlsCollapsed(true);
    };

    const resetShoppingList = () => {
        if (window.confirm('Vuoi davvero resettare la lista della spesa?')) {
            setResults(null);
            setCheckedItems(new Set());
            setListKey('');
            setCurrentTab('todo');
            setControlsCollapsed(false);
            
            localStorage.removeItem('shoppingList');
            localStorage.removeItem('shoppingChecked');
            localStorage.removeItem('shoppingListKey');
            localStorage.removeItem('shoppingTab');
        }
    };

    const toggleItem = (itemKey) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemKey)) newSet.delete(itemKey);
            else newSet.add(itemKey);
            return newSet;
        });
    };

    const formatQuantities = (quantities) => {
        return Object.entries(quantities)
            .map(([unit, value]) => {
                const displayValue = value < 1 ? value.toFixed(1) : Math.ceil(value);
                return `${displayValue} ${unit}`;
            })
            .join(', ');
    };

    const filteredItems = results ? results.filter(item => {
        const isChecked = checkedItems.has(item.name);
        return currentTab === 'todo' ? !isChecked : isChecked;
    }) : [];

    return (
        <div className="shopping-section">
            <div 
                className={`shopping-controls glass-strong ${controlsCollapsed ? 'collapsed' : ''}`}
                onClick={() => controlsCollapsed && setControlsCollapsed(false)}
            >
                {controlsCollapsed ? (
                    <div className="controls-collapsed-header">
                        <div className="controls-summary">
                            <span className="summary-label">Lista:</span>
                            <span className="summary-value">
                                {shoppingType === 'day' && `${getDayName(selectedDay)} - Settimana ${selectedWeek}`}
                                {shoppingType === 'range' && `${getDayName(startDay)} - ${getDayName(endDay)} - Settimana ${selectedWeek}`}
                                {shoppingType === 'week' && `Settimana ${selectedWeek} completa`}
                            </span>
                        </div>
                        <div className="tap-hint">Tap per modificare</div>
                    </div>
                ) : (
                    <>
                        <div className="shopping-group">
                            <label className="shopping-label">Tipo di Lista</label>
                            <select value={shoppingType} onChange={(e) => setShoppingType(e.target.value)}>
                                <option value="day">Giorno Singolo</option>
                                <option value="range">Range di Giorni</option>
                                <option value="week">Settimana Intera</option>
                            </select>
                        </div>

                        <div className="shopping-group">
                            <label className="shopping-label">Settimana</label>
                            <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
                                <option value={1}>Settimana 1</option>
                                <option value={2}>Settimana 2</option>
                                <option value={3}>Settimana 3</option>
                            </select>
                        </div>

                        {shoppingType === 'day' && (
                            <div className="shopping-group">
                                <label className="shopping-label">Giorno</label>
                                <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                                    {dayOptions.map(day => (
                                        <option key={day} value={day}>{getDayName(day)}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {shoppingType === 'range' && (
                            <>
                                <div className="shopping-group">
                                    <label className="shopping-label">Da</label>
                                    <select value={startDay} onChange={(e) => setStartDay(e.target.value)}>
                                        {dayOptions.map(day => (
                                            <option key={day} value={day}>{getDayName(day)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="shopping-group">
                                    <label className="shopping-label">A</label>
                                    <select value={endDay} onChange={(e) => setEndDay(e.target.value)}>
                                        {dayOptions.map(day => (
                                            <option key={day} value={day}>{getDayName(day)}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <button className="shopping-btn" onClick={generateShoppingList}>
                            Genera Lista Spesa
                        </button>
                    </>
                )}
            </div>

            {results && (
                <>
                    <div className="shopping-tabs">
                        <button 
                            className={`tab-btn ${currentTab === 'todo' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('todo')}
                        >
                            Da Comprare ({results.length - checkedItems.size})
                        </button>
                        <button 
                            className={`tab-btn ${currentTab === 'done' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('done')}
                        >
                            Preso ({checkedItems.size})
                        </button>
                    </div>

                    <div className="shopping-results">
                        {filteredItems.length === 0 ? (
                            <div className="empty-state" style={{textAlign: 'center', padding: '40px'}}>
                                Nessun elemento {currentTab === 'todo' ? 'da comprare' : 'preso'}
                            </div>
                        ) : (
                            filteredItems.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className={`shopping-item glass ${checkedItems.has(item.name) ? 'checked' : ''}`}
                                    onClick={() => toggleItem(item.name)}
                                >
                                    <div className="shopping-item-left">
                                        <div className="checkbox">
                                            {checkedItems.has(item.name) && "✓"}
                                        </div>
                                        <span className="shopping-item-name">{item.name}</span>
                                    </div>
                                    <span className="shopping-item-quantity">
                                        {formatQuantities(item.quantities)}
                                    </span>
                                </div>
                            ))
                        )}
                        
                        <button 
                            className="reset-shopping-btn"
                            onClick={resetShoppingList}
                        >
                            🗑️ Resetta Lista Spesa
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ShoppingPage;
