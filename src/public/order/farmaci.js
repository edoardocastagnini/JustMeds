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


// Endpoint per ottenere farmaci in base alla ricerca su NomeFarmaco o PrincipioAttivo
router.get('/api/drugs/search', async (req, res) => {
    const searchTerm = req.query.farmaco;  // "farmaco" è il parametro della query passato dall'URL
    try {
        const drugs = await Drug.find({
            $or: [
                { NomeFarmaco: { $regex: `^${searchTerm}`, $options: 'i' } },  // Cerca i farmaci che iniziano con searchTerm
                { PrincipioAttivo: { $regex: `^${searchTerm}`, $options: 'i' } }
            ]
        }).sort({ NomeFarmaco: 1 }).limit(20);
        res.json(drugs);
    } catch (error) {
        console.error('Error loading the drugs:', error);
        res.status(500).json({ message: error.message });
    }
});



// Esporta il router alla fine del file
module.exports = router;

