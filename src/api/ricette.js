/**
 * API Handler per Ricette
 * Cloudflare Workers + D1
 * 
 * GET    /api/ricette          → Lista ricette
 * GET    /api/ricette?id=X     → Singola ricetta
 * POST   /api/ricette          → Crea ricetta
 * PUT    /api/ricette          → Aggiorna ricetta
 * DELETE /api/ricette?id=X     → Elimina ricetta
 */

export async function handleRicette(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    
    try {
        // ========================================
        // GET SINGOLA RICETTA
        // ========================================
        if (method === 'GET' && url.searchParams.get('id')) {
            const id = url.searchParams.get('id');
            
            const ricetta = await env.DB.prepare(
                'SELECT * FROM ricette WHERE id = ?'
            ).bind(id).first();
            
            if (!ricetta) {
                return Response.json({ error: 'Ricetta non trovata' }, { status: 404 });
            }
            
            const ingredienti = await env.DB.prepare(
                'SELECT * FROM ingredienti WHERE ricetta_id = ? ORDER BY ordine'
            ).bind(id).all();
            
            return Response.json({
                ...ricetta,
                ingredienti: ingredienti.results
            });
        }
        
        // ========================================
        // GET LISTA RICETTE
        // ========================================
        if (method === 'GET') {
            const categoria = url.searchParams.get('categoria');
            
            let query = 'SELECT * FROM ricette';
            const params = [];
            
            if (categoria) {
                query += ' WHERE categoria = ?';
                params.push(categoria);
            }
            
            query += ' ORDER BY created_at DESC';
            
            const ricette = await env.DB.prepare(query).bind(...params).all();
            
            // Carica ingredienti per ogni ricetta
            const ricetteComplete = await Promise.all(
                ricette.results.map(async (r) => {
                    const ing = await env.DB.prepare(
                        'SELECT * FROM ingredienti WHERE ricetta_id = ? ORDER BY ordine'
                    ).bind(r.id).all();
                    
                    return { ...r, ingredienti: ing.results };
                })
            );
            
            return Response.json(ricetteComplete);
        }
        
        // ========================================
        // POST CREA RICETTA
        // ========================================
        if (method === 'POST') {
            const data = await request.json();
            
            // Insert ricetta
            const result = await env.DB.prepare(`
                INSERT INTO ricette (nome, categoria, porzione_g, foto_base64, note, user_id)
                VALUES (?, ?, ?, ?, ?, 'default_user')
            `).bind(
                data.nome,
                data.categoria,
                data.porzione_g || null,
                data.foto_base64 || null,
                data.note || null
            ).run();
            
            const ricettaId = result.meta.last_row_id;
            
            // Insert ingredienti
            if (data.ingredienti && data.ingredienti.length > 0) {
                for (let i = 0; i < data.ingredienti.length; i++) {
                    const ing = data.ingredienti[i];
                    await env.DB.prepare(`
                        INSERT INTO ingredienti (ricetta_id, ingrediente, quantita_g, ordine)
                        VALUES (?, ?, ?, ?)
                    `).bind(ricettaId, ing.ingrediente, ing.quantita_g, i).run();
                }
            }
            
            return Response.json({ success: true, id: ricettaId });
        }
        
        // ========================================
        // PUT AGGIORNA RICETTA
        // ========================================
        if (method === 'PUT') {
            const data = await request.json();
            
            if (!data.id) {
                return Response.json({ error: 'ID mancante' }, { status: 400 });
            }
            
            // Update ricetta
            await env.DB.prepare(`
                UPDATE ricette 
                SET nome = ?, categoria = ?, porzione_g = ?, foto_base64 = ?, note = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(
                data.nome,
                data.categoria,
                data.porzione_g || null,
                data.foto_base64 || null,
                data.note || null,
                data.id
            ).run();
            
            // Delete vecchi ingredienti
            await env.DB.prepare(
                'DELETE FROM ingredienti WHERE ricetta_id = ?'
            ).bind(data.id).run();
            
            // Insert nuovi ingredienti
            if (data.ingredienti && data.ingredienti.length > 0) {
                for (let i = 0; i < data.ingredienti.length; i++) {
                    const ing = data.ingredienti[i];
                    await env.DB.prepare(`
                        INSERT INTO ingredienti (ricetta_id, ingrediente, quantita_g, ordine)
                        VALUES (?, ?, ?, ?)
                    `).bind(data.id, ing.ingrediente, ing.quantita_g, i).run();
                }
            }
            
            return Response.json({ success: true });
        }
        
        // ========================================
        // DELETE ELIMINA RICETTA
        // ========================================
        if (method === 'DELETE') {
            const id = url.searchParams.get('id');
            
            if (!id) {
                return Response.json({ error: 'ID mancante' }, { status: 400 });
            }
            
            // CASCADE elimina anche ingredienti
            await env.DB.prepare(
                'DELETE FROM ricette WHERE id = ?'
            ).bind(id).run();
            
            return Response.json({ success: true });
        }
        
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
        
    } catch (error) {
        console.error('API Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
