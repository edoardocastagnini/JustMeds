const mongoose = require('mongoose');

const ordineSchema = new mongoose.Schema({
    utenteID: String,
    farmaciaID: String,
    riderID: String,
    

}, { timestamps: true, versionKey: false});

const Ordine = mongoose.model('Ordine', ordineSchema, 'ordini');

module.exports = Drug;

