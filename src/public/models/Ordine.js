const mongoose = require('mongoose');

const ordineSchema = new mongoose.Schema({
    

}, { timestamps: true });

const Ordine = mongoose.model('Ordine', ordineSchema, 'ordini');

module.exports = Drug;

