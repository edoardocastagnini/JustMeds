const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  PrincipioAttivo: String,
  ConfezioneRiferimento: String,
  ATC: String,
  AIC: String,
  Farmaco: String,
  Confezione: String,
  Ditta: String,
  PrezzoRiferimentoSSN: String,
  CodiceGruppoEquivalenza: String
}, { versionKey: false });

const Drug = mongoose.model('Drug', drugSchema, 'ListaFarmaci');

module.exports = Drug;
