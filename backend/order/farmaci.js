const express = require("express");
const router = express.Router();
const mongoose = require("../index.js");
const Drug = require("../models/Drug.js");
const tokenChecker = require("../middlewares/tokenChecker");
const jwt = require("jsonwebtoken");

function sessionChecker(req, res, next) {
  if (req.session && req.session.user) {
    console.log("Session active for user:", req.session.user);
    next();
  } else {
    console.log("Session not active, blocking request");
    res.status(403).json({ message: "Access Forbidden: No session present" });
  }
}

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

// Endpoint protetto per la ricerca di farmaci
// Questa route non dovrebbe richiedere l'autenticazione dell'utente per permettere la ricerca a tutti.
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

module.exports = router;
