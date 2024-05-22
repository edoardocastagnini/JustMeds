const mongoose = require('mongoose');
const User = require('./User');

// Definisci lo schema per le farmacie
const farmaciaSchema = new mongoose.Schema({
  nomeFarmacia: { type: String, required: true },
  indirizzo: {
    paese: { type: String, required: true },
    città: { type: String, required: true },
    via: { type: String, required: true }
  },
  numeroTelefono: { type: String, required: true },
  responsabile: {
    nome: { type: String, required: true },
    cognome: { type: String, required: true }
  }
});

// Aggiungi il discriminatore per il modello User
const Farmacia = User.discriminator('farmacia', farmaciaSchema);

module.exports = Farmacia;
