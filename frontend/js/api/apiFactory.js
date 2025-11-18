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

        if (!res.ok) {
            // Intentar leer el JSON de error del backend
            let errBody = { error: res.statusText };
            try {
                errBody = await res.json();
            } catch (e) {
                // Si no es JSON válido, usar el texto de estado HTTP
            }
            // Lanzar el error con el cuerpo para que el caller lo capture
            const error = new Error(errBody.error || `Error en ${method}`);
            error.body = errBody;
            error.status = res.status;
            throw error;
        }
    }

    return {
        async fetchAll()
        {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("No se pudieron obtener los datos");
            return await res.json();
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
        },
        async getStudentCount(id)
        {
            return await sendJSON('GET', { id, studentCount: true });
        }
    };
}
