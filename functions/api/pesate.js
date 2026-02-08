// functions/api/pesate.js
export async function onRequestGet(context) {
    try {
        const userId = 'default_user'; // TODO: Implementare autenticazione
        const data = await context.env.PESATE_KV.get(userId);
        
        return new Response(data || '{}', {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    try {
        const userId = 'default_user';
        const newData = await context.request.json();
        
        // Leggi dati esistenti
        const existingData = await context.env.PESATE_KV.get(userId);
        const pesate = existingData ? JSON.parse(existingData) : {};
        
        // Aggiungi nuova pesata
        pesate[newData.date] = {
            peso: parseFloat(newData.peso),
            timestamp: new Date().toISOString(),
            note: newData.note || ''
        };
        
        // Salva
        await context.env.PESATE_KV.put(userId, JSON.stringify(pesate));
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    try {
        const userId = 'default_user';
        const { date } = await context.request.json();
        
        const existingData = await context.env.PESATE_KV.get(userId);
        const pesate = existingData ? JSON.parse(existingData) : {};
        
        delete pesate[date];
        
        await context.env.PESATE_KV.put(userId, JSON.stringify(pesate));
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
