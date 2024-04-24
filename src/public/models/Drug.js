const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    principioAttivo: String,
    confezioneDiRiferimento: String,
    ATC: String,
    AIC: String,
    nomeFarmaco: String,
    confezione: String,
    ditta: String,
    prezzoRiferimentoSSN: Number,
    prezzoPubblico: Number,
    differenzaPrezzo: Number,
    codiceGruppoEquivalenza: String
}, { timestamps: true });

const Drug = mongoose.model('Drug', drugSchema, 'ListaFarmaci'); // 'ListaFarmaci' è il nome della collezione

module.exports = Drug;
