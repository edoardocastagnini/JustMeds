const express = require('express');
const router = express.Router();
const Ordine = require('../models/Ordine');
const { isAuthenticated } = require('../middlewares/tokenChecker');
const Drug = require('../models/Drug'); // Importa il modello Drug
const Farmacia = require('../models/ListaFarmacie'); // Importa il modello Farmacia

console.log('isAuthenticated:', typeof isAuthenticated); // Dovrebbe stampare 'function'
if (typeof isAuthenticated !== 'function') {
  throw new Error('isAuthenticated non è una funzione');
}

// Endpoint per ottenere gli ordini in base allo stato e alla farmacia
router.get('/ordini', isAuthenticated, async (req, res) => {
  const { stato } = req.query;
  const farmaciaID = req.session.user && req.session.user.type === 'farmacia' ? req.session.user.farmaciaID : undefined;

  console.log('stato:', stato); // Log del valore di stato
  console.log('farmaciaID:', farmaciaID); // Log del valore di farmaciaID

  if (!farmaciaID) {
    return res.status(400).json({ success: false, message: 'FarmaciaID is missing or user is not authorized' });
  }

  try {
    const ordini = await Ordine.find({ stato, farmaciaID });
    if (ordini.length === 0) {
      console.log('Nessun ordine trovato per i criteri specificati.'); // Log per nessun ordine trovato
    }
    res.status(200).json(ordini);
  } catch (error) {
    console.error('Errore nel recuperare gli ordini:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero degli ordini', error });
  }
});

// Esempio di un endpoint per ottenere i dettagli di un farmaco
router.get('/api/farmaci/:id', async (req, res) => {
  try {
    const farmaco = await Drug.findById(req.params.id);
    if (!farmaco) {
      return res.status(404).json({ message: 'Farmaco non trovato' });
    }
    res.json(farmaco);
  } catch (error) {
    console.error('Errore nel recuperare il farmaco:', error);
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
router.get('/farmacia/:id', async (req, res) => {
  try {
    console.log('Richiesta per farmacia ID:', req.params.id); // Aggiungi questo log
    const farmacia = await Farmacia.findById(req.params.id);
    if (!farmacia) {
      console.log('Farmacia non trovata per ID:', req.params.id); // Aggiungi questo log
      return res.status(404).send('Farmacia non trovata');
    }
    res.send(farmacia);
  } catch (error) {
    console.error('Errore nel recuperare le informazioni della farmacia:', error);
    res.status(500).send('Errore nel recuperare le informazioni della farmacia');
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
    console.error('Errore nel recuperare gli ordini candidati:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero degli ordini candidati', error });
  }
});

// Endpoint per ottenere gli ordini in corso (confermato)
router.get('/ordini/incorso', isAuthenticated, async (req, res) => {
  const farmaciaID = req.session.user && req.session.user.type === 'farmacia' ? req.session.user.farmaciaID : undefined;

  if (!farmaciaID) {
    return res.status(400).json({ success: false, message: 'FarmaciaID is missing or user is not authorized' });
  }

  try {
    const ordini = await Ordine.find({ stato: 'confermato', farmaciaID });
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
    console.error('Errore nel recuperare lo storico ordini:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero dello storico ordini', error });
  }
});


module.exports = router;
