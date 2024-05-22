const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const Carrello = require("../models/Carrello.js");
const ListaFarmacie = require("../models/ListaFarmacie.js"); 
const Ordine = require("../models/Ordine.js");


const { isAuthenticated } = require("../middlewares/tokenChecker.js");


router.get('/user/address', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;  // Assicurati che l'ID utente sia salvato nella sessione al login
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" });
        }
        res.json({
            nome: user.nome,
            cognome: user.cognome,
            città: user.città,
            cap: user.cap,
            provincia: user.provincia,
            via: user.via,
        });
    } catch (error) {
        console.error('Errore nel recuperare i dati utente:', error);
        res.status(500).json({ message: 'Errore interno del server', error });
    }
  });


router.get('/cart/details', isAuthenticated, async (req, res) => {
    const clienteId = req.session.user.id;
    try {
        const cart = await Carrello.findOne({ _id: clienteId }).populate('prodotti._id');
        if (!cart) {
            return res.status(404).json({ message: 'Carrello non trovato' });
        }
        const items = cart.prodotti.map(item => ({
            nome: item._id.Farmaco, // Assumendo che 'nome' sia un campo del documento a cui il prodotto è collegato
            quantità: item.quantita,
            prezzo: item.prezzo
        }));
        res.json({ items, totalPrice: cart.totale });
    } catch (error) {
        console.error('Errore nel recuperare i dettagli del carrello:', error);
        res.status(500).json({ message: 'Errore interno del server', error });
    }
  });
  
router.get('/farmacie', async (req, res) => {
  try {
      const farmacie = await ListaFarmacie.find({});
      res.json({ success: true, farmacie: farmacie });
  } catch (error) {
      console.error('Errore nel recuperare la lista delle farmacie:', error);
      res.status(500).json
  }
});



router.post('/order/create', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id; // ID utente dalla sessione
  const userAddress = await User.findById(userId).select('nome cognome città cap provincia via');
  const cart = await Carrello.findOne({ _id: userId }).populate('prodotti._id');

  if (!cart || cart.prodotti.length === 0) {
      return res.status(400).json({ success: false, message: 'Il carrello è vuoto.' });
  }

  try {
    const farmacia = await ListaFarmacie.findOne({ _id:req.body.farmaciaId });
    if (!farmacia) {
        return res.status(400).json({ success: false, message: 'Farmacia non trovata.' });
    }
      const newOrder = new Ordine({
          utenteID: userId,
          farmaciaID: farmacia._id,
          riderID: null,
          secretcode: Math.floor(1000 + Math.random() * 9000).toString(),
          prodotti: cart.prodotti.map(item => ({
              _id: item._id._id,
              quantita: item.quantita,
              prezzo: item.prezzo
          })),
          indirizzoCliente: {
              nome: userAddress.nome,
              cognome: userAddress.cognome,
              città: userAddress.città,
              cap: userAddress.cap,
              provincia: userAddress.provincia,
              via: userAddress.via,
          },
          indirizzoFarmacia: {
              via: farmacia.INDIRIZZO,
              cap: farmacia.CAP,
              provincia: farmacia.PROVINCIA
          },
          stato: 'inviato',
          prezzoFinale: '',
          
      });

      await newOrder.save();

      // Pulire il carrello dopo l'ordine
      cart.prodotti = [];
      cart.totale = 0;
      await cart.save();

      res.json({ success: true, message: 'Ordine creato con successo' });
  } catch (error) {
      console.error('Errore nella creazione dell\'ordine:', error);
      res.status(500).json({ success: false, message: 'Errore tecnico nella creazione dell\'ordine' });
  }
});


  module.exports = router;