const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

router.post('/contact', async (req, res) => {
    try {
        const { name, email, orderNumber, message } = req.body;
        const newFormEntry = new Form({ name, email, orderNumber, message });
        await newFormEntry.save();
        res.status(200).json({ success: true, message: 'Messaggio inviato con successo! la risposta sarà visibile all\' interno del tuo account' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio dei dati' });
    }
});

module.exports = router;
