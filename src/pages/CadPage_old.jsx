import React, { useState } from 'react';
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

            <div className="cad-list">
                {filteredCads.map((cad, idx) => (
                    <div key={idx} className="cad-card" onClick={() => setModalCad(cad)}>
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
        </div>
    );
}