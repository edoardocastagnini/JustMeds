const express = require("express");
const router = express.Router();
const moongose = require("mongoose");

const Ordine = require("../models/Ordine");
const { isAuthenticated } = require("../middlewares/tokenChecker");

// Aggiungi questo endpoint per ottenere i dettagli dell'ordine
router.get('/ordini/:orderId', isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.params;
      const ordine = await Ordine.findById(orderId).populate('prodotti._id', 'Farmaco');
  
      if (!ordine) {
        return res.status(404).json({ message: 'Ordine non trovato' });
      }
  
      res.json(ordine);
    } catch (error) {
      console.error('Errore durante il recupero dell\'ordine:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  });


router.post('/ordini/:orderId/cancella', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const ordine = await Ordine.findById(orderId);
        if (!ordine) {
            return res.status(404).send({ message: 'Ordine non trovato' });
        }
        ordine.stato = 'cancellato';
        await ordine.save();
        res.status(200).send({ message: 'Ordine annullato con successo' });
    } catch (error) {
        console.error('Errore durante l\'annullamento dell\'ordine:', error);
        res.status(500).send({ message: 'Errore durante l\'annullamento dell\'ordine' });
    }
});

router.post('/payment', isAuthenticated, async (req, res) => {
  const { orderId } = req.body;
  try {
      const ordine = await Ordine.findById(orderId);
      if (!ordine) {
          return res.status(404).json({ message: 'Ordine non trovato' });
      }
      ordine.stato = 'confermato';
      await ordine.save();
      res.status(200).json({ message: 'Pagamento simulato con successo' });
  } catch (error) {
      console.error('Errore durante il pagamento simulato:', error);
      res.status(500).json({ message: 'Errore durante il pagamento simulato' });
  }
});

  module.exports = router;