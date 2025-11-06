// backend/server.js
// Express server for Zarahome-like-home project

const express = require('express');
const Airtable = require('airtable');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Airtable config
const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

// Example: GET all records from a table

// Cotizaciones
app.post('/api/cotizaciones', async (req, res) => {
    try {
        const created = await base('Cotizaciones').create([{ fields: req.body }]);
        res.json(created.map(r => r.fields));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Contactos
app.post('/api/contactos', async (req, res) => {
    try {
        const created = await base('Contactos').create([{ fields: req.body }]);
        res.json(created.map(r => r.fields));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Usuarios (registro/login)
app.post('/api/usuarios', async (req, res) => {
    try {
        const created = await base('Usuarios').create([{ fields: req.body }]);
        res.json(created.map(r => r.fields));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Suscripciones (newsletter)
app.post('/api/suscripciones', async (req, res) => {
    try {
        const created = await base('Suscripciones').create([{ fields: req.body }]);
        res.json(created.map(r => r.fields));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
