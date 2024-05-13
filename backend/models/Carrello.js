const mongoose = require('mongoose');

// Schema per un singolo prodotto nel carrello
const prodottoSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drug',   
        required: true,
        alias: 'productId'
    },
    quantita: {
        type: Number,
        required: true,
        min: 1
    },
    prezzo: {
        type: Number,   
        required: true,
        min: 0
    }
},{id: false, versionKey: false});

// Schema per il carrello
const carrelloSchema = new mongoose.Schema({
    _id: {
        type: String,  //l'id del cliente, ovvero il suo CF
        required: true,
        alias: 'clienteId'
    },
    prodotti: [prodottoSchema],
    totale: {
        type: Number,
        required: true,
        default: 0
    }
},{id:false, versionKey: false});

const Carrello = mongoose.model('Carrello', carrelloSchema, 'carrello');

module.exports = Carrello;
