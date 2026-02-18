/**
 * DietAPP - Cloudflare Worker Entry Point
 * Gestisce API ricette e serve React app
 */

import { handleRicette } from './api/ricette';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
        
        // Handle preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        // API Ricette
        if (url.pathname.startsWith('/api/ricette')) {
            const response = await handleRicette(request, env);
            Object.entries(corsHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return response;
        }
        
        // Serve React app
        return env.ASSETS.fetch(request);
    }
};
