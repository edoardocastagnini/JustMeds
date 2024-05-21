const mongoose = require('mongoose');

const farmaciaSchema = new mongoose.Schema({
  _id: { type: String, required: true, alias: 'COD_FARMACIA_OD' },
  COD_FARMACIA: { type: String, required: true },
  FARMACIA: { type: String, required: true },
  IVA: { type: String, required: true },
  CAP: { type: String, required: true },
  COD_COMUNE: { type: String, required: true },
  COMUNE: { type: String, required: true },
  FRAZIONE: { type: String },
  COD_PROVINCIA: { type: String, required: true },
  PROVINCIA: { type: String, required: true },
  COD_REGIONE: { type: String, required: true },
  REGIONE: { type: String, required: true },
  DATA_INIZIO: { type: Date, required: true },
  INDIRIZZO: { type: String, required: true },
  TIPOLOGIA: { type: String, required: true },
  LATITUDINE_P: { type: String, required: true },
  LONGITUDINE_P: { type: String, required: true },
  LATITUDINE_V: { type: String },
  LONGITUDINE_V: { type: String }
}, { collection: 'ListaFarmacie' });

module.exports = mongoose.model('ListaFarmacie', farmaciaSchema);
