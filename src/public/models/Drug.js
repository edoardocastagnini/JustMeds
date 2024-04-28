const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    _id: String,
    PrincipioAttivo: String,
    ConfezioneDiRiferimento: String,
    ATC: String,
    AIC: String,
    NomeFarmaco: String,
    Confezione: String,
    Ditta: String,
    PrezzoRiferimentoSSN: String,
    CodiceGruppoEquivalenza: String
}, { timestamps: true });

const Drug = mongoose.model('Drug', drugSchema, 'ListaFarmaci');

module.exports = Drug;

