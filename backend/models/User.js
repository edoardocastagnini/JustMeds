const mongoose = require('mongoose');

// Definisci lo schema e il modello per gli utenti
const userSchema = new mongoose.Schema({
  _id: { type: String, required: true, alias: 'CF' }, // Usa _id come CF
  nome: String,
  cognome: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  dataDiNascita: Date,
  guadagni: Number,
  città: String,
  cap: String,
  provincia: String,
  via: String,
  type: String
}, { id: false, versionKey: false  }); // Disabilita l'auto-creazione dell'id virtuale

// Indica a Mongoose di usare il CF come ID primario
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;