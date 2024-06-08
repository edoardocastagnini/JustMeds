const express = require("express");
const router = express.Router();

const Ordine = require("../models/Ordine");

const { isAuthenticated } = require("../middlewares/tokenChecker");

// VISUALIZZAZIONE ORDINI
// Endpoint per recuperare tutti gli ordini con stato "confermato"
router.get("/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await Ordine.find({ stato: "confermato" });
      res.json(orders);
    } catch (error) {
      console.error("Errore nel recuperare gli ordini:", error);
      res.status(500).json({ success: false, message: "Errore durante il recupero degli ordini" });
    }

  });
  
  // VISUALIZZAZIONE ORDINE SPECIFICO
  // Endpoint per recuperare un singolo ordine
  router.get("/orders/:orderId", isAuthenticated, async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Ordine.findById(orderId).populate('prodotti._id');
      if (!order) {
        return res.status(404).json({ success: false, message: "Ordine non trovato" });
      }
      res.json(order);
    } catch (error) {
      console.error("Errore nel recuperare l'ordine:", error);
      res.status(500).json({ success: false, message: "Errore durante il recupero dell'ordine" });
    }
  });

  router.get("/rider/ongoing_order", isAuthenticated, async (req, res) => {
    try {
        const riderId = req.session.user.id;
        //stato attesa o inconsegna
        const orders = await Ordine.find({ riderID: riderId, stato: { $in: ['attesa', 'inconsegna'] } });
        res.json(orders);
    } catch (error) {
        console.error('Errore nel recuperare gli ordini:', error);
        res.status(500).json({ message: 'Errore nel recuperare gli ordini' });
    }
});

  router.post("/orders/:orderId/complete", isAuthenticated, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Ordine.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Ordine non trovato' });
        }
        if (order.stato !== 'inconsegna') {
            return res.status(400).json({ message: 'Ordine non in consegna' });
        }
        order.stato = 'consegnato';
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Errore nel completare l\'ordine:', error);
        res.status(500).json({ message: 'Errore nel completare l\'ordine' });
    }
});

  module.exports = router;
  
  