const mongoose = require('mongoose');
// Definisci lo schema e il modello per gli utenti
const userSchema = new mongoose.Schema({
    nome: String,
    cognome: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dataDiNascita: Date,
    CF: String,
    paese: String,
    città: String,
    via: String,
    type: String
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;