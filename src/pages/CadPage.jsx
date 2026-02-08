import React, { useState, useEffect } from 'react';

function CadPage({ cadData, setModalCad }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    const allCads = (cadData?.codici_alimentari || []);

    const groupedCads = {};
    
    allCads.forEach(cad => {
        const category = cad.categoria || 'Altro';
        
        if (!groupedCads[category]) {
            groupedCads[category] = [];
        }
        
        if (!searchTerm.trim()) {
            groupedCads[category].push(cad);
        } else {
            const matchSearch = 
                cad.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cad.codice.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (matchSearch) {
                groupedCads[category].push(cad);
            }
        }
    });

    Object.keys(groupedCads).forEach(cat => {
        if (groupedCads[cat].length === 0) {
            delete groupedCads[cat];
        }
    });

    const categoryOrder = [
        'Primi',
        'Secondi',
        'Frutta',
        'Ingredienti Base',
        'Altro'
    ];

    const sortedCategories = Object.keys(groupedCads).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    useEffect(() => {
        if (searchTerm.trim()) {
            setExpandedCategories(new Set(sortedCategories));
        } else {
            setExpandedCategories(new Set());
        }
    }, [searchTerm]);

    const toggleCategory = (category) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const highlightText = (text, search) => {
        if (!search.trim()) return text;
        const parts = text.split(new RegExp(`(${search})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === search.toLowerCase() 
                ? <mark key={index} className="search-highlight">{part}</mark>
                : part
        );
    };

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

            <div className="cad-list">
                {sortedCategories.length === 0 ? (
                    <div className="empty-state" style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)'}}>
                        Nessun risultato trovato
                    </div>
                ) : (
                    sortedCategories.map((category) => {
                        const isExpanded = expandedCategories.has(category);
                        const cadsInCategory = groupedCads[category];

                        return (
                            <div key={category} className="cad-category">
                                <div 
                                    className={`category-header ${isExpanded ? 'expanded' : ''}`}
                                    onClick={() => toggleCategory(category)}
                                >
                                    <div className="category-info">
                                        <span className="category-name">{category}</span>
                                        <span className="category-count">({cadsInCategory.length})</span>
                                    </div>
                                    <svg className="category-chevron" viewBox="0 0 24 24">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>

                                <div className={`category-content ${isExpanded ? 'expanded' : ''}`}>
                                    {cadsInCategory.map((cad, idx) => (
                                        <div key={idx} className="cad-card" onClick={() => setModalCad(cad)}>
                                            <div className="cad-header">
                                                <span className="cad-code">
                                                    {highlightText(cad.codice, searchTerm)}
                                                </span>
                                            </div>
                                            <div className="cad-name">
                                                {highlightText(cad.nome, searchTerm)}
                                            </div>
                                            <div className="cad-description">
                                                {cad.descrizione.substring(0, 100)}...
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default CadPage;
