import React from 'react';
function CadModal({ cad, onClose }) {
    if (!cad) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-strong" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="cad-container">
                {cad.categoria && (
                    <div className="cad-category-badge">{cad.categoria}</div>
                )}
                <div className="cad-category-badge">{cad.codice}</div>
                </div>
              
                <div className="cad-name">{cad.nome}</div>
                <div className="cad-description">{cad.descrizione}</div>

                {cad.ricetta_base && cad.ricetta_base.ingredienti && cad.ricetta_base.ingredienti.length > 0 && (
                    <div className="recipe-section">
                        <div className="recipe-title">Ricetta Base</div>
                        <div className="recipe-name">{cad.ricetta_base.nome}</div>
                        <div className="ingredient-list">
                            {cad.ricetta_base.ingredienti.map((ing, i) => (
                                <div key={i} className="ingredient-item">
                                    • {ing.nome} - {ing.quantita} {ing.unita}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {cad.alternative && cad.alternative.length > 0 && (
                    <div className="alternatives-section">
                        <div className="alternatives-title">Alternative</div>
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

export default CadModal;