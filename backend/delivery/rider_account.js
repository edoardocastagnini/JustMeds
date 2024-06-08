const express = require("express");
const router = express.Router();

const User = require("../models/User");

const { isAuthenticated } = require("../middlewares/tokenChecker");

//Endpoint per visualizzare i guadagni del rider
router.get("/rider_account/earnings", isAuthenticated, async (req, res) => {
    const rider = await User.findById(req.session.user.id);
    if (!rider) {
        return res.status(404).json({ error: "Rider not found" });
    }
    res.json({
        total: rider.guadagni
    });
    });

module.exports = router;