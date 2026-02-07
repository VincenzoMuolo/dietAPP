import React from 'react';
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