const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug' },
        quantity: { type: Number, required: true, min: 1 }
    }]
});

module.exports = mongoose.model('Cart', CartSchema);

