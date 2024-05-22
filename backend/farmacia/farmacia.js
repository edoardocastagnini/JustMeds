const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ordine = require('../models/Ordine');
const { isAuthenticated } = require('../middlewares/tokenChecker');
const Drug = require('../models/Drug');
const ListaFarmacie = require('../models/ListaFarmacie');

// Assicurati che `isAuthenticated` sia una funzione
if (typeof isAuthenticated !== 'function') {
  throw new Error('isAuthenticated non è una funzione');
}

// Endpoint per ottenere gli ordini in base allo stato e alla farmacia
router.get('/ordini', isAuthenticated, async (req, res) => {
  const { stato } = req.query;
  const farmaciaID = req.session.user && req.session.user.type === 'farmacia' ? req.session.user.farmaciaID : undefined;

  if (!farmaciaID) {
    return res.status(400).json({ success: false, message: 'FarmaciaID is missing or user is not authorized' });
  }

  try {
    const ordini = await Ordine.find({ stato, farmaciaID });
    res.status(200).json(ordini);
  } catch (error) {
    console.error('Errore durante il recupero degli ordini:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero degli ordini', error });
  }
});

// Endpoint per ottenere i dettagli di un farmaco
router.get('/farmaci/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const farmaco = await Drug.findById(id);
    if (!farmaco) {
      return res.status(404).json({ message: 'Farmaco non trovato' });
    }
    res.json(farmaco);
  } catch (error) {
    console.error('Errore durante il recupero del farmaco:', error);
    res.status(500).json({ message: 'Errore durante il recupero del farmaco' });
  }
});

// Endpoint per ottenere le informazioni del profilo
router.get('/profile', isAuthenticated, (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ message: 'Non autenticato' });
  }
  res.json(user);
});

// Endpoint per ottenere le informazioni della farmacia
router.get('/farmacia/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const farmacia = await ListaFarmacie.findById(id);
    if (!farmacia) {
      return res.status(404).json({ message: 'Farmacia non trovata' });
    }
    res.json(farmacia);
  } catch (error) {
    console.error('Errore nel recuperare le informazioni della farmacia:', error);
    res.status(500).json({ message: 'Errore nel recuperare le informazioni della farmacia' });
  }
});

// Endpoint per ottenere gli ordini candidati (inviato)
router.get('/ordini/candidati', isAuthenticated, async (req, res) => {
  const farmaciaID = req.session.user && req.session.user.type === 'farmacia' ? req.session.user.farmaciaID : undefined;

  if (!farmaciaID) {
    return res.status(400).json({ success: false, message: 'FarmaciaID is missing or user is not authorized' });
  }

  try {
    const ordini = await Ordine.find({ stato: 'inviato', farmaciaID });
    res.status(200).json(ordini);
  } catch (error) {
    console.error('Errore durante il recupero degli ordini candidati:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero degli ordini candidati', error });
  }
});

// Endpoint per ottenere gli ordini in corso (attesa)
router.get('/ordini/incorso', isAuthenticated, async (req, res) => {
  const farmaciaID = req.session.user && req.session.user.type === 'farmacia' ? req.session.user.farmaciaID : undefined;

  if (!farmaciaID) {
    return res.status(400).json({ success: false, message: 'FarmaciaID is missing or user is not authorized' });
  }

  try {
    const ordini = await Ordine.find({ stato: 'attesa', farmaciaID });
    res.status(200).json(ordini);
  } catch (error) {
    console.error('Errore nel recuperare gli ordini in corso:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero degli ordini in corso', error });
  }
});





// Endpoint per ottenere lo storico ordini (in attesa o consegnato)
router.get('/ordini/storico', isAuthenticated, async (req, res) => {
  const farmaciaID = req.session.user && req.session.user.type === 'farmacia' ? req.session.user.farmaciaID : undefined;

  if (!farmaciaID) {
    return res.status(400).json({ success: false, message: 'FarmaciaID is missing or user is not authorized' });
  }

  try {
    const ordini = await Ordine.find({ stato: { $in: ['in attesa', 'consegnato'] }, farmaciaID });
    res.status(200).json(ordini);
  } catch (error) {
    console.error('Errore durante il recupero dello storico ordini:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero dello storico ordini', error });
  }
});

// Endpoint per ottenere i dettagli di un ordine
router.get('/ordini/:id', isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const ordine = await Ordine.findById(id).populate('prodotti._id', 'Farmaco');
    if (!ordine) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }
    res.json(ordine);
  } catch (error) {
    console.error('Errore durante il recupero dell\'ordine:', error);
    res.status(500).json({ message: 'Errore durante il recupero dell\'ordine', error });
  }
});

// Endpoint per aggiornare il prezzo dell'ordine
router.post('/ordini/:id/aggiornaPrezzo', isAuthenticated, async (req, res) => {
  console.log(`Ricevuta richiesta per aggiornare il prezzo dell'ordine con ID: ${req.params.id}`);
  const orderId = req.params.id;
  const { prezzoFinale } = req.body;

  try {
    const ordine = await Ordine.findById(orderId);
    if (!ordine) {
      console.log(`Ordine con ID ${orderId} non trovato`);
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    console.log(`Aggiornamento prezzo per l'ordine con ID ${orderId} a ${prezzoFinale}`);
    ordine.prezzoFinale = prezzoFinale;
    await ordine.save();

    res.status(200).json({ message: 'Prezzo aggiornato con successo', ordine });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del prezzo dell\'ordine:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del prezzo dell\'ordine', error });
  }
});

// Endpoint per cambiare lo stato di un ordine
router.post('/ordini/:id/cambiaStato', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { stato } = req.body;

  try {
    const ordine = await Ordine.findById(id);
    if (!ordine) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    ordine.stato = stato;
    await ordine.save();

    res.status(200).json({ message: 'Stato aggiornato con successo', ordine });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dello stato dell\'ordine:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento dello stato dell\'ordine', error });
  }
});


// Endpoint per ottenere lo storico ordini (inconsegna o consegnato)
router.get('/ordini/storico', isAuthenticated, async (req, res) => {
  const farmaciaID = req.session.user && req.session.user.type === 'farmacia' ? req.session.user.farmaciaID : undefined;

  if (!farmaciaID) {
    return res.status(400).json({ success: false, message: 'FarmaciaID is missing or user is not authorized' });
  }

  try {
    const ordini = await Ordine.find({ stato: { $in: ['inconsegna', 'consegnato'] }, farmaciaID });
    res.status(200).json(ordini);
  } catch (error) {
    console.error('Errore durante il recupero dello storico ordini:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero dello storico ordini', error });
  }
});



module.exports = router;
