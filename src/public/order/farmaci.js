const express = require('express');
const router = express.Router(); // Crea un'istanza del router
const mongoose = require('mongoose');
const Drug = require('../models/Drug.js'); // Assicurati che il percorso del modello sia corretto

// Assicurati di connetterti a MongoDB (se non lo fai altrove)
mongoose.connect('mongodb://localhost:27017/Database', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Endpoint per ottenere i primi 10 farmaci
router.get('/api/drugs', async (req, res) => {
    try {
        const drugs = await Drug.find({}).sort({ NomeFarmaco: 1 }).limit(10);
        console.log(drugs); // Aggiungi questo log per vedere l'output
        res.json(drugs);
    } catch (error) {
        console.error('Error loading the drugs:', error);
        res.status(500).json({ message: error.message });
    }
});

// Esporta il router alla fine del file
module.exports = router;
