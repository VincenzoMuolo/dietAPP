import React, { useState, useEffect } from 'react';

function RecipesPage() {
    const [ricette, setRicette] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [selectedRicetta, setSelectedRicetta] = useState(null);
    const [categoriaFilter, setCategoriaFilter] = useState('all');

    // Load ricette
    useEffect(() => {
        loadRicette();
    }, [categoriaFilter]);

    const loadRicette = async () => {
        try {
            const url = categoriaFilter === 'all' 
                ? '/api/ricette' 
                : `/api/ricette?categoria=${categoriaFilter}`;
            
            const response = await fetch(url);
            const data = await response.json();
            setRicette(data);
        } catch (error) {
            console.error('Errore caricamento:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Eliminare questa ricetta?')) return;

        try {
            await fetch(`/api/ricette?id=${id}`, { method: 'DELETE' });
            await loadRicette();
        } catch (error) {
            console.error('Errore eliminazione:', error);
        }
    };

    const handleEdit = (ricetta) => {
        setSelectedRicetta(ricetta);
        setView('edit');
    };

    const handleViewDetails = (ricetta) => {
        setSelectedRicetta(ricetta);
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                Caricamento...
            </div>
        );
    }

    return (
        <div className="container recipes-container">
            {/* HEADER */}
            <div className="recipes-header">
                <div className="recipes-title">RICETTE</div>
                <button 
                    className="add-recipe-btn"
                    onClick={() => {
                        setSelectedRicetta(null);
                        setView('add');
                    }}
                >
                    + NUOVA
                </button>
            </div>

            {view === 'list' && (
                <>
                    {/* FILTRI CATEGORIA */}
                    <div className="category-filters">
                        <button
                            className={`filter-btn ${categoriaFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setCategoriaFilter('all')}
                        >
                            TUTTE
                        </button>
                        <button
                            className={`filter-btn ${categoriaFilter === 'salse_yogurt' ? 'active' : ''}`}
                            onClick={() => setCategoriaFilter('salse_yogurt')}
                        >
                            SALSE YOGURT
                        </button>
                    </div>

                    {/* LISTA RICETTE */}
                    {ricette.length === 0 ? (
                        <div className="empty-state">
                            Nessuna ricetta trovata
                        </div>
                    ) : (
                        <div className="recipes-list">
                            {ricette.map((ricetta) => (
                                <RecipeCard
                                    key={ricetta.id}
                                    ricetta={ricetta}
                                    onEdit={() => handleEdit(ricetta)}
                                    onDelete={() => handleDelete(ricetta.id)}
                                    onView={() => handleViewDetails(ricetta)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {(view === 'add' || view === 'edit') && (
                <RecipeForm
                    ricetta={selectedRicetta}
                    onSave={async () => {
                        await loadRicette();
                        setView('list');
                    }}
                    onCancel={() => setView('list')}
                />
            )}

            {/* MODAL DETTAGLI */}
            {selectedRicetta && view === 'list' && (
                <RecipeDetailModal
                    ricetta={selectedRicetta}
                    onClose={() => setSelectedRicetta(null)}
                    onEdit={() => handleEdit(selectedRicetta)}
                />
            )}
        </div>
    );
}

/* ============================================
   RECIPE CARD
   ============================================ */

function RecipeCard({ ricetta, onEdit, onDelete, onView }) {
    return (
        <div className="recipe-card" onClick={onView}>
            {ricetta.foto_base64 && (
                <div className="recipe-card-photo">
                    <img src={ricetta.foto_base64} alt={ricetta.nome} />
                </div>
            )}
            
            <div className="recipe-card-header">
                <div className="recipe-card-name">{ricetta.nome}</div>
                <div className="recipe-card-portion">{ricetta.porzione_g}g</div>
            </div>
            
            <div className="recipe-card-category">
                {ricetta.categoria.replace('_', ' ')}
            </div>
            
            <div className="recipe-card-ingredients">
                {ricetta.ingredienti.slice(0, 3).map((ing, idx) => (
                    <span key={idx} className="ingredient-tag">
                        {ing.ingrediente}
                    </span>
                ))}
                {ricetta.ingredienti.length > 3 && (
                    <span className="ingredient-tag-more">
                        +{ricetta.ingredienti.length - 3}
                    </span>
                )}
            </div>
            
            {ricetta.note && (
                <div className="recipe-card-note">{ricetta.note}</div>
            )}
            
            <div className="recipe-card-actions">
                <button
                    className="recipe-action-btn edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                >
                    MODIFICA
                </button>
                <button
                    className="recipe-action-btn delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    ELIMINA
                </button>
            </div>
        </div>
    );
}

/* ============================================
   RECIPE FORM
   ============================================ */

function RecipeForm({ ricetta, onSave, onCancel }) {
    const [nome, setNome] = useState(ricetta?.nome || '');
    const [categoria, setCategoria] = useState(ricetta?.categoria || 'salse_yogurt');
    const [porzioneG, setPorzioneG] = useState(ricetta?.porzione_g || 100);
    const [note, setNote] = useState(ricetta?.note || '');
    const [fotoBase64, setFotoBase64] = useState(ricetta?.foto_base64 || '');
    const [ingredienti, setIngredienti] = useState(ricetta?.ingredienti || [
        { ingrediente: '', quantita_g: '' }
    ]);
    const [saving, setSaving] = useState(false);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Verifica tipo
        if (!file.type.startsWith('image/')) {
            alert('Seleziona un\'immagine valida');
            return;
        }

        // Verifica dimensione (max 1MB prima compressione)
        if (file.size > 1000000) {
            alert('Immagine troppo grande! Max 1MB');
            return;
        }

        // Comprimi e converti in base64
        const reader = new FileReader();
        reader.onload = async (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                // Ridimensiona se troppo grande
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Converti in base64 con compressione
                const compressed = canvas.toDataURL('image/jpeg', 0.85);
                
                // Verifica dimensione finale
                if (compressed.length > 700000) { // ~500KB
                    alert('Foto ancora troppo grande dopo compressione. Usa un\'immagine più piccola.');
                    return;
                }

                setFotoBase64(compressed);
            };
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setFotoBase64('');
    };

    const addIngrediente = () => {
        setIngredienti([...ingredienti, { ingrediente: '', quantita_g: '' }]);
    };

    const removeIngrediente = (index) => {
        setIngredienti(ingredienti.filter((_, i) => i !== index));
    };

    const updateIngrediente = (index, field, value) => {
        const updated = [...ingredienti];
        updated[index][field] = value;
        setIngredienti(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                nome,
                categoria,
                porzione_g: parseInt(porzioneG),
                foto_base64: fotoBase64 || null,
                note,
                ingredienti: ingredienti
                    .filter(ing => ing.ingrediente && ing.quantita_g)
                    .map(ing => ({
                        ingrediente: ing.ingrediente,
                        quantita_g: parseFloat(ing.quantita_g)
                    }))
            };

            if (ricetta?.id) {
                payload.id = ricetta.id;
                await fetch('/api/ricette', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch('/api/ricette', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            onSave();
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="recipe-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <div className="form-title">
                    {ricetta ? 'MODIFICA RICETTA' : 'NUOVA RICETTA'}
                </div>
            </div>

            <div className="form-section">
                <label className="form-label">NOME RICETTA</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Es: Caesar Fit"
                    required
                    className="form-input"
                />
            </div>

            <div className="form-row">
                <div className="form-section">
                    <label className="form-label">CATEGORIA</label>
                    <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="form-input"
                    >
                        <option value="salse_yogurt">Salse Yogurt</option>
                        <option value="primi">Primi</option>
                        <option value="secondi">Secondi</option>
                        <option value="contorni">Contorni</option>
                        <option value="dolci">Dolci</option>
                    </select>
                </div>

                <div className="form-section">
                    <label className="form-label">PORZIONE (g)</label>
                    <input
                        type="number"
                        value={porzioneG}
                        onChange={(e) => setPorzioneG(e.target.value)}
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-section">
                <label className="form-label">FOTO RICETTA</label>
                <div className="photo-upload-container">
                    {fotoBase64 ? (
                        <div className="photo-preview">
                            <img src={fotoBase64} alt="Preview" className="photo-preview-img" />
                            <button
                                type="button"
                                className="photo-remove-btn"
                                onClick={handleRemovePhoto}
                            >
                                × Rimuovi
                            </button>
                        </div>
                    ) : (
                        <label className="photo-upload-label">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="photo-upload-input"
                            />
                            <div className="photo-upload-placeholder">
                                <span className="photo-upload-icon">📷</span>
                                <span className="photo-upload-text">Clicca per aggiungere foto</span>
                                <span className="photo-upload-hint">Max 1MB • Formato: JPG, PNG</span>
                            </div>
                        </label>
                    )}
                </div>
            </div>

            <div className="form-section">
                <label className="form-label">NOTE</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note sulla ricetta..."
                    className="form-textarea"
                    rows="3"
                />
            </div>

            <div className="form-section">
                <div className="ingredients-header">
                    <label className="form-label">INGREDIENTI</label>
                    <button
                        type="button"
                        className="add-ingredient-btn"
                        onClick={addIngrediente}
                    >
                        + AGGIUNGI
                    </button>
                </div>

                <div className="ingredients-list-form">
                    {ingredienti.map((ing, idx) => (
                        <div key={idx} className="ingredient-input-row">
                            <input
                                type="text"
                                value={ing.ingrediente}
                                onChange={(e) => updateIngrediente(idx, 'ingrediente', e.target.value)}
                                placeholder="Ingrediente"
                                className="form-input ingredient-name-input"
                            />
                            <input
                                type="number"
                                step="0.1"
                                value={ing.quantita_g}
                                onChange={(e) => updateIngrediente(idx, 'quantita_g', e.target.value)}
                                placeholder="g"
                                className="form-input ingredient-qty-input"
                            />
                            {ingredienti.length > 1 && (
                                <button
                                    type="button"
                                    className="remove-ingredient-btn"
                                    onClick={() => removeIngrediente(idx)}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-actions">
                <button
                    type="button"
                    className="form-cancel-btn"
                    onClick={onCancel}
                >
                    ANNULLA
                </button>
                <button
                    type="submit"
                    className="form-save-btn"
                    disabled={saving}
                >
                    {saving ? 'SALVATAGGIO...' : 'SALVA'}
                </button>
            </div>
        </form>
    );
}

/* ============================================
   RECIPE DETAIL MODAL
   ============================================ */

function RecipeDetailModal({ ricetta, onClose, onEdit }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-strong recipe-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                {ricetta.foto_base64 && (
                    <div className="recipe-modal-photo">
                        <img src={ricetta.foto_base64} alt={ricetta.nome} />
                    </div>
                )}

                <div className="recipe-modal-header">
                    <div className="recipe-modal-name">{ricetta.nome}</div>
                    <div className="recipe-modal-meta">
                        <span className="recipe-modal-category">
                            {ricetta.categoria.replace('_', ' ')}
                        </span>
                        <span className="recipe-modal-portion">
                            {ricetta.porzione_g}g
                        </span>
                    </div>
                </div>

                {ricetta.note && (
                    <div className="recipe-modal-note">{ricetta.note}</div>
                )}

                <div className="recipe-modal-section">
                    <div className="recipe-modal-subtitle">INGREDIENTI</div>
                    <div className="recipe-modal-ingredients">
                        {ricetta.ingredienti.map((ing, idx) => (
                            <div key={idx} className="recipe-modal-ingredient">
                                <span className="ingredient-name">{ing.ingrediente}</span>
                                <span className="ingredient-qty">{ing.quantita_g}g</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="recipe-modal-actions">
                    <button
                        className="recipe-modal-btn edit"
                        onClick={() => {
                            onClose();
                            onEdit();
                        }}
                    >
                        MODIFICA
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RecipesPage;
