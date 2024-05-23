const mongoose = require('mongoose');


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

const ordineSchema = new mongoose.Schema({
    utenteID: String,
    farmaciaID: String,
    prodotti: [prodottoSchema],
    riderID: String,
    stato: {
        type: String,
        enum: ['inviato', 'accettato', 'rifiutato', 'confermato', 'attesa', 'consegnato', 'cancellato'],
        default: 'In attesa'
    },
    secretcode: String,
    indirizzoCliente: {
        nome: String,
        cognome: String,
        via: String,
        città: String,
        paese: String
    },
    indirizzoFarmacia: {
        via: String,
        cap: String,
        provincia: String
    },
    prezzoFinale: Number,
}, { versionKey: false});

const Ordine = mongoose.model('Ordine', ordineSchema, 'ordini');

module.exports = Ordine;