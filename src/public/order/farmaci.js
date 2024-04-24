const express = require('express');
const router = express.Router(); // Crea un'istanza del router
const mongoose = require('mongoose');
const Drug = require('../models/Drug.js'); // Assicurati che il percorso del modello sia corretto

// Assicurati di connetterti a MongoDB (se non lo fai altrove)
mongoose.connect('mongodb://localhost:27017/Database', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Endpoint per ottenere i primi 10 farmaci
router.get('/api/drugs', async (req, res) => {
    try {
        const drugs = await Drug.find({}).sort({ NomeFarmaco: 1 }).limit(10);
        console.log(drugs); // Aggiungi questo log per vedere l'output
        res.json(drugs);
    } catch (error) {
        console.error('Error loading the drugs:', error);
        res.status(500).json({ message: error.message });
    }
});


// Endpoint per ottenere farmaci in base alla ricerca su NomeFarmaco o PrincipioAttivo
router.get('/api/drugs/search', async (req, res) => {
    const searchTerm = req.query.farmaco;  // "farmaco" è il parametro della query passato dall'URL
    try {
        const drugs = await Drug.find({
            $or: [
                { NomeFarmaco: { $regex: `^${searchTerm}`, $options: 'i' } },  // Cerca i farmaci che iniziano con searchTerm
                { PrincipioAttivo: { $regex: `^${searchTerm}`, $options: 'i' } }
            ]
        }).sort({ NomeFarmaco: 1 }).limit(20);
        res.json(drugs);
    } catch (error) {
        console.error('Error loading the drugs:', error);
        res.status(500).json({ message: error.message });
    }
});


// Aggiungi un articolo al carrello
router.post('/api/cart/add', async (req, res) => {
    const { userId, productId, quantity } = req.body;
  
    try {
      let cart = await Cart.findOne({ userId: userId });
      if (!cart) {
        // Crea un nuovo carrello se non esiste
        cart = new Cart({ userId, products: [] });
      }
      // Aggiungi o aggiorna il prodotto nel carrello
      const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
      await cart.save();
      res.status(201).json(cart);
    } catch (error) {
      console.error('Error updating the cart:', error);
      res.status(500).json({ message: error.message });
    }
  });
  

// Esporta il router alla fine del file
module.exports = router;

