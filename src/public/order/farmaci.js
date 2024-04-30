const express = require('express');
const router = express.Router(); // Crea un'istanza del router
// Assicurati di usare il percorso corretto per importare mongoose dal file di configurazione della connessione
const mongoose = require('../../index'); 
const Drug = require('../models/Drug.js'); 

// Endpoint per ottenere i primi 10 farmaci
router.get('/api/drugs', async (req, res) => {
    try {
        const drugs = await Drug.aggregate([{ $sample: { size: 10 } }]).sort({ NomeFarmaco: 1 }); // Ottieni 10 farmaci in modo casuale
        console.log("Drugs fetched:", drugs); // Mostra l'output nel log
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
                { PrincipioAttivo: { $regex: `^${searchTerm}`, $options: 'i' } },  // Cerca i farmaci che iniziano con searchTerm
                { Farmaco: { $regex: `^${searchTerm}`, $options: 'i' } }
            ]
        }).sort({ Farmaco: 1 }).limit(20);
        res.json(drugs);
    } catch (error) {
        console.error('Error loading the drugs:', error);
        res.status(500).json({ message: error.message });
    }
});

// Esporta il router alla fine del file
module.exports = router;
