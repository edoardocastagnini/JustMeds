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

const loginRoutes = require("./auth/login");
app.use("/api", loginRoutes);

const deliveryRoutes = require("./delivery/delivery");
app.use("/api", deliveryRoutes);
const deliveryManagementRoutes = require("./delivery/delivery_management");
app.use("/api", deliveryManagementRoutes);

const drugRoutes = require("./order/order_cart");

app.use("/api", drugRoutes);

const adminRoutes = require("../backend/admin/admin");
app.use('/api/admin', adminRoutes);


const contattaciRouter = require("./form_request/contattaci");
app.use('/api', contattaciRouter);


const clientRouter = require("./client_account/client");
app.use('/api',clientRouter);

const farmaciaRoutes = require("../backend/farmacia/farmacia");
app.use('/api', farmaciaRoutes);

const pagamentoRoutes = require("../backend/pagamento/pagamento");
app.use('/api', pagamentoRoutes);



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




app.listen(3000, () => {
  console.log("Server running on port 3000");
});

