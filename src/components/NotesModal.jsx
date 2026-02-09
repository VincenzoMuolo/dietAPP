import React, { useState } from 'react';

function NotesModal({ notesData, onClose, autoTrackEnabled, onEnableTracking, onResetTracking }) {
    const [selectedWeek, setSelectedWeek] = useState(1);

    const handleEnableTracking = () => {
        onEnableTracking(selectedWeek);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-strong" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="notes-section">
                    <h2>Impostazioni</h2>
                    <div className="settings-item">
                        <div className="settings-label">
                            <div className="settings-label-title">Tracking Automatico Giorni</div>
                            <div className="settings-label-desc">
                                Mostra automaticamente il menu del giorno corrente
                            </div>
                        </div>
                        {!autoTrackEnabled ? (
                            <div className='settings-week-sel' style={{display: 'flex', gap: 'var(--space-sm)', alignItems: 'center'}}>
                                <select 
                                    value={selectedWeek} 
                                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                                    style={{
                                        padding: 'var(--space-sm) var(--space-md)',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-card)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        color: 'var(--text-primary)',
                                        fontSize: 'var(--text-sm)'
                                    }}
                                >
                                    <option value={1}>Settimana 1</option>
                                    <option value={2}>Settimana 2</option>
                                    <option value={3}>Settimana 3</option>
                                </select>
                                <button className="toggle-btn" onClick={handleEnableTracking}>
                                    Attiva
                                </button>
                            </div>
                        ) : (
                            <button className="reset-btn" onClick={onResetTracking}>
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="note-category">
                        <h2>Norme Generali</h2>
                        
                        <h3>Comportamenti da Evitare</h3>
                        <div className="note-item">
                            <ul className="note-list">
                                {notesData.norme_generali.comportamenti_da_evitare.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <h3>Metodi di Cottura</h3>
                        <div className="note-item">
                            <strong>Carne e Pesce:</strong>
                            <ul className="note-list">
                                {notesData.norme_generali.metodi_di_cottura.carne_e_pesce.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="note-item">
                            <strong>Verdure:</strong>
                            <ul className="note-list">
                                {notesData.norme_generali.metodi_di_cottura.verdure.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <h3>Personalizzazione dei Pasti</h3>
                        <div className="note-item">
                            <p>{notesData.norme_generali.personalizzazioni_dei_pasti.descrizione}</p>
                            <strong>Esempi:</strong>
                            <ul className="note-list">
                                {notesData.norme_generali.personalizzazioni_dei_pasti.esempi.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <h3>Acqua</h3>
                        <div className="note-item">
                            <p><strong>Tipo:</strong> {notesData.norme_generali.acqua.tipo}</p>
                            <p><strong>Temperatura:</strong> {notesData.norme_generali.acqua.temperatura}</p>
                            <p><strong>Quantità:</strong> {notesData.norme_generali.acqua.quantita_raccomandata}</p>
                            <p><strong>Durante i pasti:</strong> {notesData.norme_generali.acqua.durante_pasti}</p>
                        </div>

                        <h3>Altre Indicazioni</h3>
                        {notesData.norme_generali.surgelati && (
                            <div className="note-item">
                                <strong>Surgelati:</strong> {notesData.norme_generali.surgelati.descrizione}
                            </div>
                        )}
                        {notesData.norme_generali.spezie_e_aromi && (
                            <div className="note-item">
                                <strong>Spezie e Aromi:</strong> {notesData.norme_generali.spezie_e_aromi.descrizione}
                            </div>
                        )}
                        {notesData.norme_generali.sale && (
                            <div className="note-item">
                                <strong>Sale:</strong> {notesData.norme_generali.sale.descrizione}
                            </div>
                        )}
                    </div>

                    <div className="note-category">
                        <h2>Pesi e Misure</h2>
                        
                        <h3>Peso Alimenti</h3>
                        <div className="note-item">
                            <p><strong>Momento pesatura:</strong> {notesData.pesi_e_misure.peso_alimenti.momento_pesatura}</p>
                            <p><strong>Alimenti surgelati:</strong> {notesData.pesi_e_misure.peso_alimenti.alimenti_surgelati}</p>
                            <p><strong>Parte edibile:</strong> {notesData.pesi_e_misure.peso_alimenti.parte_edibile}</p>
                            {notesData.pesi_e_misure.peso_alimenti.esempi_parte_edibile && (
                                <>
                                    <strong>Esempi:</strong>
                                    <ul className="note-list">
                                        {notesData.pesi_e_misure.peso_alimenti.esempi_parte_edibile.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        <h3>Bilancia</h3>
                        {notesData.pesi_e_misure.bilancia_pesa_alimenti && (
                            <div className="note-item">
                                <p>{notesData.pesi_e_misure.bilancia_pesa_alimenti.controllo_precisione}</p>
                                <p><strong>Metodo:</strong> {notesData.pesi_e_misure.bilancia_pesa_alimenti.metodo_controllo}</p>
                            </div>
                        )}

                        <h3>Approssimazione</h3>
                        {notesData.pesi_e_misure.approssimazione && (
                            <div className="note-item">
                                <p><strong>Avvertenza:</strong> {notesData.pesi_e_misure.approssimazione.avvertenza}</p>
                                <p><strong>Regola:</strong> {notesData.pesi_e_misure.approssimazione.regola}</p>
                                <p><strong>Errore da evitare:</strong> {notesData.pesi_e_misure.approssimazione.errore_da_evitare}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotesModal;
