const express = require("express");
const router = express.Router();
const User = require("../models/User");
const path = require('path');
const Carrello = require("../models/Carrello");
const { isAuthenticated } = require("../middlewares/tokenChecker");
const { checkUserRole } = require("../middlewares/tokenChecker");
// Rotte per la registrazione e il login
router.post("/sign_up", async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
      console.log("Record inserted successfully");
      
      if (user.type === "ricevente") {
        const cart = new Carrello({
          clienteId: user._id,
          prodotti: [],
          totale: 0
        });
        await cart.save();
        console.log("Cart created successfully");
      }
      
      res.redirect("../auth/SignupSuccess.html");
    } catch (err) {
      console.error(err);
      
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} già esistente. Per favore, usa un altro ${field}.`;
        res.status(409).send({ success: false, message });
      } else {
        res.status(500).send({ success: false, message: err.message });
      }
    }
  });
  
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    req.session.user = {
      id: user._id,
      email: user.email,
      type: user.type,
      farmaciaID: user.type === 'farmacia' ? user._id : undefined
    };
    
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      console.log('User logged in:', req.session.user);
      res.json({ success: true, message: 'Logged in successfully', role: user.type });
    });
  });
  

// Rotte per le pagine statiche
router.use(express.static(path.join(__dirname, '../frontend')));

// Rotte protette per le pagine HTML
router.get('/farmacia/farmacia.html', isAuthenticated, checkUserRole(['farmacia']), (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/farmacia/farmacia.html'));
});

router.get('/admin/admin.html', isAuthenticated, checkUserRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/admin.html'));
});

// Rotte di logout e verifica login
router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Failed to log out.");
      } else {
        return res.redirect("/"); // or your login page
      }
    });
  } else {
    res.end();
  }
});



router.get("/", (req, res) => {
  try {
    res.redirect("../frontend/index.html");
  } catch (error) {
    console.error("Error handling root route:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;