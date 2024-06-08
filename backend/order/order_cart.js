const express = require("express");
const router = express.Router();
const mongoose = require("../index.js");
const Drug = require("../models/Drug.js");
const tokenChecker = require("../middlewares/tokenChecker.js");
const jwt = require("jsonwebtoken");
const Carrello = require("../models/Carrello.js");
const { isAuthenticated } = require("../middlewares/tokenChecker.js");


function sessionChecker(req, res, next) {
  if (req.session && req.session.user) {
    console.log("Session active for user:", req.session.user);
    next();
  } else {
    console.log("Session not active, blocking request");
    res.status(403).json({ message: "Access Forbidden: No session present" });
  }
}
router.get("/check-login", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ isLoggedIn: true, userRole: req.session.user.type });
    console.log("Ruolo:", req.session.user.type);
  } else {
    res.json({ isLoggedIn: false });
  }
});
router.get("/drugs", async (req, res) => {
  try {
    const drugs = await Drug.aggregate([{ $sample: { size: 10 } }]);
    const isLoggedIn = req.session && req.session.user ? true : false;
    res.json({ drugs, isLoggedIn });
  } catch (error) {
    console.error("Error loading the drugs:", error);
    res.status(500).json({ message: error.message });
  }
});

// Endpoint la ricerca di farmaci
router.get("/drugs/search", async (req, res) => {
  const searchTerm = req.query.farmaco;
  try {
    const drugs = await Drug.find({
      $or: [
        { PrincipioAttivo: { $regex: `^${searchTerm}`, $options: "i" } },
        { Farmaco: { $regex: `^${searchTerm}`, $options: "i" } },
      ],
    }).limit(20);
    const isLoggedIn = req.session && req.session.user ? true : false;
    res.json({ drugs, isLoggedIn });
  } catch (error) {
    console.error("Error loading the drugs:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/cart', isAuthenticated, async (req, res) => {
  const clienteId = req.session.user.id; 
  console.log("clienteId:", clienteId)
  try {
      
      const cart = await Carrello.findOne({ _id: clienteId })
          .populate({
              path: 'prodotti._id',
              model: 'Drug',
              select: 'Farmaco PrezzoRiferimentoSSN'  
          });

      if (!cart || cart.prodotti.length === 0) {
          return res.status(200).json({ success: true, items: [] });
      }

      
      const items = cart.prodotti.map(item => ({
          id: item.productId._id,
          name: item.productId.Farmaco,         // Nome del farmaco
          quantity: item.quantita,              // Quantità
          price: item.prezzo                   // Prezzo per unità
      }));

      res.status(200).json({ success: true, items: items });
  } catch (error) {
      console.error('Errore nel recuperare il carrello:', error);
      res.status(500).json({ success: false, message: 'Errore durante il recupero del carrello', error });
  }
});


// RIMOZIONE ARTICOLO DAL CARRELLO
router.post('/cart/remove', isAuthenticated, async (req, res) => {
  const { id } = req.body;
  const clienteId = req.session.user.id;
  try {
      const cart = await Carrello.findOne({ _id: clienteId });
      if (!cart) {
          return res.status(404).json({ message: 'Carrello non trovato' });
      }

      // Rimuovi l'articolo dal carrello
      cart.prodotti = cart.prodotti.filter(item => item.productId.toString() !== id);
      cart.totale = cart.prodotti.reduce((acc, item) => acc + item.prezzo, 0);
      await cart.save();

      res.json({ success: true, message: 'Articolo rimosso dal carrello' });
  } catch (error) {
      console.error('Errore nella rimozione dell\'articolo:', error);
      res.status(500).json({ success: false, message: 'Errore durante la rimozione dell\'articolo', error });
  }
});


router.post('/cart/change', isAuthenticated, async (req, res) => {
  const { productId, change } = req.body; // change è il delta, può essere 1 o -1
  const userId = req.session.user.id;

  try {
      const cart = await Carrello.findOne({ _id: userId });
      if (!cart) {
          return res.status(404).json({ success: false, message: 'Carrello non trovato' });
      }

      const itemIndex = cart.prodotti.findIndex(item => item.productId.toString() === productId);

      if (itemIndex > -1) {
          cart.prodotti[itemIndex].quantita += change;
          if (cart.prodotti[itemIndex].quantita < 1) {
              cart.prodotti.splice(itemIndex, 1);
          }
          cart.totale += change * cart.prodotti[itemIndex].prezzo;
          await cart.save();
          res.json({ success: true, message: 'Quantità aggiornata', cart: cart });
      } else {
          res.status(404).json({ success: false, message: 'Prodotto non trovato nel carrello' });
      }
  } catch (error) {
      console.error('Errore nella modifica della quantità nel carrello:', error);
      res.status(500).json({ success: false, message: 'Errore tecnico nel modificare la quantità' });
  }
});



router.post('/cart/add', async (req, res) => {
  const { productId, quantity, price } = req.body;
  const clienteId = req.session.user.id; // Utilizzo del codice fiscale
  console.log("productId:", productId, "quantity:", quantity, "clienteId:", clienteId)
  try {
      const cart = await Carrello.findOne({ _id: clienteId });
      console.log("Carrello:", cart);
      // Se il carrello non esiste, restituisci un errore
      if (!cart) {
          return res.status(404).json({ message: 'Carrello non trovato' });
      }
        // Trova l'indice del prodotto nel carrello
        const productIndex = cart.prodotti.findIndex(p => p._id.toString() === productId);
        let priceCorrect = price.replace(',', '.');
        let priceNumber = parseFloat(priceCorrect);
        console.log("priceNumber:", priceNumber);
        if (productIndex !== -1) {
            // Prodotto esiste, aggiorna la quantità
            cart.prodotti[productIndex].quantita += quantity;
            cart.prodotti[productIndex].prezzo = priceNumber*quantity;
            console.log("Prodotto esiste, aggiorna la quantità")
        } else {
            // Prodotto non esiste, aggiungilo
            cart.prodotti.push({ productId, quantita: quantity, prezzo: priceNumber});
            console.log("Prodotto non esiste, aggiungilo")
        }
      cart.totale += quantity * priceNumber;  // Aggiorna il totale
      await cart.save();
      res.status(200).json({ success: true, message: 'Prodotto aggiunto al carrello', carrello: cart });
  } catch (error) {
      console.error('Errore aggiunta al carrello:', error);
      res.status(500).json({ success: false, message: 'Errore durante l\'aggiunta al carrello', error });
  }
});


module.exports = router;
