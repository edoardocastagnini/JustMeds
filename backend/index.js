const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require('./auth/authGoogle'); 
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
app.use("/api/v1", loginRoutes);

const deliveryRoutes = require("./delivery/delivery");
app.use("/api/v1", deliveryRoutes);
const deliveryManagementRoutes = require("./delivery/delivery_management");
app.use("/api/v1", deliveryManagementRoutes);

const drugRoutes = require("./order/order_cart");
app.use("/api/v1", drugRoutes);

const adminRoutes = require("../backend/admin/admin");
app.use('/api/admin/v1', adminRoutes);

const authGoogleRoutes = require("./auth/authGoogleRoutes"); // Aggiungi questa riga
app.use("/api", authGoogleRoutes); // Aggiungi questa riga

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

app.use(passport.initialize());
app.use(passport.session());

// Middleware di autenticazione
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('./auth/login.html');
  }
}

const checkoutRouter = require("./order/checkout");
app.use('/api/v1',checkoutRouter);

const UserFarmacia = require("./models/UserFarmacia");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
