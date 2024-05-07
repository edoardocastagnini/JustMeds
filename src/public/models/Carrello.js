const mongoose = require('mongoose');

// Schema per un singolo prodotto nel carrello
const prodottoSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drug',  // Assicurati che 'Drug' sia il nome corretto del modello del prodotto
        required: true
    },
    quantita: {
        type: Number,
        required: true,
        min: 1
    },
    prezzo: {
        type: Number,
        required: true
    }
});

// Schema per il carrello
const carrelloSchema = new mongoose.Schema({
    clienteId: {
        type: String,  //l'id del cliente, ovvero il suo CF
        required: true
    },
    prodotti: [prodottoSchema],
    totale: {
        type: Number,
        required: true,
        default: 0
    }
},{versionKey: false});

const Carrello = mongoose.model('Carrello', carrelloSchema, 'carrello');

module.exports = Carrello;
