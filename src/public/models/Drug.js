const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    PrincipioAttivo: String,
    ConfezioneDiRiferimento: String,
    ATC: String,
    AIC: String,
    NomeFarmaco: String,
    Confezione: String,
    Ditta: String,
    PrezzoRiferimentoSSN: String,
    CodiceGruppoEquivalenza: String
},{versionKey: false });

const Drug = mongoose.model('Drug', drugSchema, 'ListaFarmaci');

module.exports = Drug;

