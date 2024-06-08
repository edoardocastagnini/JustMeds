const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require('../backend/auth/authGoogle');
const User = require('./models/User')
const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();

// Middleware per il parsing del corpo delle richieste
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');

app.use(express.static("../frontend"));


// Configurazione della sessione
app.use(
  session({
    secret: "sanremo",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 },
  })
);

// Middleware per il CORS
const cors = require("cors");
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const tokenChecker = require("./middlewares/tokenChecker");


const deliveryRoutes = require("./delivery/delivery");
app.use("/api/v1", deliveryRoutes);

const deliveryManagementRoutes = require("./delivery/delivery_management");
app.use("/api/v1", deliveryManagementRoutes);

const ongoingDeliveryRoutes = require("./delivery/ongoing_delivery");
app.use("/api/v1", ongoingDeliveryRoutes);

const riderAccountRoutes = require("./delivery/rider_account");
app.use("/api/v1", riderAccountRoutes);

const drugRoutes = require("./order/order_cart");
app.use("/api/v1", drugRoutes);

const adminRoutes = require("../backend/admin/admin");
app.use('/api/admin/v1', adminRoutes);

const contattaciRouter = require("./form_request/contattaci");
app.use('/api/v1', contattaciRouter);


const clientRouter = require("./client_account/client");
app.use('/api/v1',clientRouter);

const farmaciaRoutes = require("../backend/farmacia/farmacia");
app.use('/api/v1', farmaciaRoutes);

const pagamentoRoutes = require("../backend/pagamento/pagamento");
app.use('/api/v1', pagamentoRoutes);



const Carrello = require("./models/Carrello");

// Connessione al database
const DbURI = "mongodb+srv://adminuser:adminuser@justmedsdata.d6avjw7.mongodb.net/Data?retryWrites=true&w=majority&appName=JustMedsData";
mongoose
.connect(DbURI)
.then(() => console.log("MongoDB Atlas connected"))
.catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

app.set("view engine", "ejs");
app.use(morgan("dev"));

// Rotte per l'autenticazione con Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/loginFail.html' }),
  function(req, res) {
    req.session.user = {
      id: req.user._id,
      email: req.user.email,
      type: req.user.type,
      farmaciaID: req.user.type === 'farmacia' ? req.user._id : undefined
    };
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (req.session.user.type === 'farmacia') {
        return res.redirect('/farmacia/farmacia.html');
      }
      if (req.session.user.type === 'admin') {
        return res.redirect('/admin/admin.html');
      }
      if (req.session.user.type === 'ricevente') {
        return res.redirect('/order/order.html');
      }
      if (req.session.user.type === 'rider') {
        return res.redirect('/delivery/delivery.html');
      }
    });
  }
);




// Rotte per la registrazione e il login
app.post("/sign_up", async (req, res) => {
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

app.post('/login', async (req, res) => {
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


// Middleware di autenticazione
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('./auth/login.html');
  }
}

const checkoutRouter = require("./order/checkout");
app.use('/api',checkoutRouter);


const UserFarmacia = require("./models/UserFarmacia");

// Middleware di autorizzazione
function checkUserRole(role) {
  return (req, res, next) => {

    const userRole = req.session.user && req.session.user.type;
    if (userRole === 'admin' || role.includes(userRole)) {

      next();
    } else {
      res.status(403).send("Accesso negato: non hai i permessi per accedere a questa pagina");
    }
  };
}

// Rotte per le pagine statiche
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotte protette per le pagine HTML
app.get('/farmacia/farmacia.html', isAuthenticated, checkUserRole(['farmacia']), (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/farmacia/farmacia.html'));
});

app.get('/admin/admin.html', isAuthenticated, checkUserRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/admin.html'));
});

// Rotte di logout e verifica login
app.get("/logout", (req, res) => {
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



app.get("/", (req, res) => {
  try {
    res.redirect("../frontend/index.html");
  } catch (error) {
    console.error("Error handling root route:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

