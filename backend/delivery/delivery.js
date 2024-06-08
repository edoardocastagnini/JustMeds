const express = require("express");
const router = express.Router();

const Ordine = require("../models/Ordine");

const { isAuthenticated } = require("../middlewares/tokenChecker");


// Endpoint per recuperare tutti gli ordini
router.get("/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await Ordine.find({ stato: "confermato" });
      res.json(orders);
    } catch (error) {
      console.error("Errore nel recuperare gli ordini:", error);
      res.status(500).json({ success: false, message: "Errore durante il recupero degli ordini" });
    }

  });
  

  // Endpoint per recuperare un singolo ordine specifico
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



  module.exports = router;
  
  