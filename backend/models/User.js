const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true, alias: 'CF' }, // Usa _id come CF
  nomeFarmacia: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  indirizzo: {
    paese: { type: String, required: true },
    città: { type: String, required: true },
    via: { type: String, required: true }
  },
  type: { type: String, default: 'farmacia', required: true },
  numeroTelefono: { type: String, required: true },
  responsabile: {
    nome: { type: String, required: true },
    cognome: { type: String, required: true }
  }
}, { id: false, versionKey: false }); // Disabilita l'auto-creazione dell'id virtuale

// Indica a Mongoose di usare il CF come ID primario
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
