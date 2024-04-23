const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    principioAttivo: { type: String, required: true },
    confezioneDiRiferimento: String,
    ATC: String,
    AIC: String,
    nomeFarmaco: { type: String, required: true },
    confezione: String,
    ditta: String,
    prezzoRiferimentoSSN: { type: Number, required: true },
    prezzoPubblico: Number,
    differenzaPrezzo: Number,
    codiceGruppoEquivalenza: String
}, { timestamps: true });

const Drug = mongoose.model('Drug', drugSchema, 'ListaFarmaci'); // 'ListaFarmaci' è il nome della collezione

module.exports = Drug;
