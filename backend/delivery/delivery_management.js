const express = require("express");
const router = express.Router();

const Ordine = require("../models/Ordine");


// Endpoint per aggiornare lo stato dell'ordine a "attesa"
router.post('/orders/:id/accept', async (req, res) => {
    const orderId = req.params.id;
    console.log(`POST /api/orders/${orderId}/accept`);
  
    try {
      // Recupera l'ordine dal database utilizzando il modello Ordine
      const order = await Ordine.findById(orderId);
  
      if (order) {
        // Aggiorna lo stato dell'ordine
        order.stato = 'attesa';
        order.riderID = req.session.user.id; // Imposta l'ID del rider che ha accettato l'ordine
        // Salva l'ordine aggiornato nel database
        await order.save();
        res.status(200).json({ message: 'Ordine accettato' });
      } else {
        res.status(404).json({ message: 'Ordine non trovato' });
      }
    } catch (error) {
      console.error('Errore durante l\'accettazione dell\'ordine:', error);
      res.status(500).json({ message: 'Errore durante l\'accettazione dell\'ordine', error });
    }
  });
  


  module.exports = router;