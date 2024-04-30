const mongoose = require('mongoose');
// Definisci lo schema e il modello per gli utenti
const carrelloSchema = new mongoose.Schema({
    ClienteID: String,
    Prodotti: Array,
},{versionKey: false });

const Carrello = mongoose.model('Carrello', userSchema, 'carrello');

module.exports = Carrello;