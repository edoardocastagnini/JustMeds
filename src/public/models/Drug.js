const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    PrincipioAttivo: String,
    ConfezioneDiRiferimento: String,
    ATC: String,
    AIC: String,
    NomeFarmaco: String,
    Confezione: String,
    Ditta: String,
    PrezzoRiferimentoSSN: Number,
    CodiceGruppoEquivalenza: String
}, { timestamps: true });

const Drug = mongoose.model('Drug', drugSchema, 'ListaFarmaci');

module.exports = Drug;
