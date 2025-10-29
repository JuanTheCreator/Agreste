# Backend API para Zarahome-like-home

Este backend usa Express.js y Airtable para gestionar los datos.

## Endpoints principales
- `GET /api/:table` — Obtiene todos los registros de una tabla
- `POST /api/:table` — Crea un registro en una tabla
- `PUT /api/:table/:id` — Actualiza un registro por ID
- `DELETE /api/:table/:id` — Elimina un registro por ID

## Configuración
1. Copia `.env.example` a `.env` y pon tu API Key y Base ID de Airtable.
2. Instala dependencias con `npm install`.
3. Inicia el servidor con `npm start`.

## Ejemplo de uso con Postman
- Haz peticiones a `http://localhost:3001/api/<nombre_tabla>`

## Seguridad
No compartas tu API Key públicamente.
