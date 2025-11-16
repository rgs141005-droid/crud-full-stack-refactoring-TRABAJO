/**
*    File        : frontend/js/api/apiFactory.js
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 3.0 ( prototype )
*/

export function createAPI(moduleName, config = {}) 
{
    const API_URL = config.urlOverride ?? `../../backend/server.php?module=${moduleName}`;

    async function sendJSON(method, data) 
    {
        const res = await fetch(API_URL,
        {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const text = await res.text();
        let payload = null;
        try { payload = text ? JSON.parse(text) : null; } catch (e) { payload = null; }

        if (!res.ok) {
            const msg = payload?.error ?? payload?.message ?? res.statusText ?? `Error en ${method}`;
            throw new Error(msg);
        }

        return payload;
    }

    return {
        async fetchAll()
        {
            const res = await fetch(API_URL);
            const text = await res.text();
            let payload = null;
            try { payload = text ? JSON.parse(text) : null; } catch (e) { payload = null; }

            if (!res.ok) {
                const msg = payload?.error ?? payload?.message ?? res.statusText ?? "No se pudieron obtener los datos";
                throw new Error(msg);
            }

            return payload;
        },
        async create(data)
        {
            return await sendJSON('POST', data);
        },
        async update(data)
        {
            return await sendJSON('PUT', data);
        },
        async remove(id)
        {
            return await sendJSON('DELETE', { id });
        }
    };
}
