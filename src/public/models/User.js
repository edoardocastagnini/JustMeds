const mongoose = require('mongoose');
// Definisci lo schema e il modello per gli utenti
const userSchema = new mongoose.Schema({
    _id: String,
    nome: String,
    cognome: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dataDiNascita: Date,
    paese: String,
    città: String,
    via: String,
    type: String
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;