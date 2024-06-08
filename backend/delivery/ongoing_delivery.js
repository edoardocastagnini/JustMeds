const express = require("express");
const router = express.Router();

const Ordine = require("../models/Ordine");
const User = require("../models/User");

const { isAuthenticated } = require("../middlewares/tokenChecker");

// Endpoint per recuperare l'ordine accettato dal rider (stato attesa o inconsegna) del rider
router.get("/rider/ongoing_order", isAuthenticated, async (req, res) => {
    try {
        const riderId = req.session.user.id;
        const orders = await Ordine.find({ riderID: riderId, stato: { $in: ['attesa', 'inconsegna'] } });
        res.json(orders);
    } catch (error) {
        console.error('Errore nel recuperare gli ordini:', error);
        res.status(500).json({ message: 'Errore nel recuperare gli ordini' });
    }
});

// Endpoint per aggiornare lo stato dell'ordine a "consegnato"
  router.post("/orders/:orderId/complete", isAuthenticated, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const rider = await User.findById(req.session.user.id);
        const order = await Ordine.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Ordine non trovato' });
        }
        if (order.stato !== 'inconsegna') {
            return res.status(400).json({ message: 'Ordine non in consegna' });
        }
        order.stato = 'consegnato';
        rider.guadagni += 5;
        await order.save();
        await rider.save();
        res.json(order);
    } catch (error) {
        console.error('Errore nel completare l\'ordine:', error);
        res.status(500).json({ message: 'Errore nel completare l\'ordine' });
    }
});

  // Endpoint per annullare l'accettazione dell'ordine (torna a stato confermato)
  router.post('/orders/:id/cancel', async (req, res) => {
    const orderId = req.params.id;
    console.log(`POST /api/orders/${orderId}/cancel`);
  
    try {
        const order = await Ordine.findById(orderId);
        if (order) {
            order.stato = 'confermato'; // Imposta lo stato dell'ordine su 'confermato'
            await order.save();
            res.status(200).json({ message: 'Accettazione dell\'incarico annullata' });
        } else {
            res.status(404).json({ message: 'Ordine non trovato' });
        }
    } catch (error) {
        console.error('Errore durante l\'annullamento dell\'accettazione dell\'incarico:', error);
        res.status(500).json({ message: 'Errore durante l\'annullamento dell\'accettazione dell\'incarico', error });
    }
  });

module.exports = router;