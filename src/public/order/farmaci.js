const express = require('express');
const router = express.Router();
const mongoose = require('../../index'); 
const Drug = require('../models/Drug.js');
require('dotenv').config();    // Carica le variabili d'ambiente dal file .env
const tokenChecker = require('../middlewares/tokenChecker');
const jwt = require('jsonwebtoken');

// Endpoint protetto per ottenere i primi 10 farmaci
router.get('/api/drugs', tokenChecker, async (req, res) => {
    try {
        const drugs = await Drug.aggregate([{ $sample: { size: 10 } }]).sort({ NomeFarmaco: 1 });
        console.log("Drugs fetched:", drugs);
        res.json(drugs);
    } catch (error) {
        console.error('Error loading the drugs:', error);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint protetto per la ricerca di farmaci
router.get('/api/drugs/search', tokenChecker, async (req, res) => {
    const searchTerm = req.query.farmaco;
    try {
        const drugs = await Drug.find({
            $or: [
                { PrincipioAttivo: { $regex: `^${searchTerm}`, $options: 'i' } },
                { Farmaco: { $regex: `^${searchTerm}`, $options: 'i' } }
            ]
        }).sort({ Farmaco: 1 }).limit(20);
        res.json(drugs);
    } catch (error) {
        console.error('Error loading the drugs:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
