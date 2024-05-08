const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();
require("dotenv").config(); // console.log(process.env.SUPER_SECRET);
// Middleware per il parsing del corpo delle richieste
app.use(express.json()); // Per supportare il corpo delle richieste in formato JSON
app.use(express.urlencoded({ extended: true })); // Per supportare il corpo delle richieste URL-encoded

app.use(express.static("public"));
app.use(
  session({
    secret: "sanremo",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 }, // Assicurati che 'secure' sia true se sei su HTTPS
  })
);

const cors = require("cors");
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const tokenChecker = require("./public/middlewares/tokenChecker");

const drugRoutes = require("./public/order/farmaci");
app.use("/api", drugRoutes);

const User = require("./public/models/User");
const Carrello = require("./public/models/Carrello");

// La tua stringa di connessione Atlas
const DbURI =
  "mongodb+srv://adminuser:adminuser@justmedsdata.d6avjw7.mongodb.net/Data?retryWrites=true&w=majority&appName=JustMedsData";

mongoose
  .connect(DbURI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

app.set("view engine", "ejs");
app.use(morgan("dev"));

// Ora usa User per interagire con la collezione users
app.post("/sign_up", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    console.log("Record inserted successfully");

    const cart = new Carrello({
      clienteId: user._id, // Utilizzo del codice fiscale
      prodotti: [],
      totale: 0
    });
    await cart.save();

    console.log("Cart created successfully");

    setTimeout(() => {
      res.redirect("login.html");
    }, 2000);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
const jwt = require("jsonwebtoken");

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
      return res.status(404).json({ message: 'User not found' });
  }

  if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.user = { id: user._id, email: user.email, type: user.type };
  res.json({ success: true, message: 'Logged in successfully', role: user.type });
});


function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send({ success: false, message: "Not authenticated" });
  }
}

app.get("/protected-route", isAuthenticated, (req, res) => {
  res.send("Access to protected route!");
});

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
    res.end(); // if not logged in, just end the response
  }
});

app.get("/api/check-login", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ isLoggedIn: true, userRole: req.session.user.type });
    console.log("Ruolo:", req.session.user.type);
  } else {
    res.json({ isLoggedIn: false });
  }
});

app.get("/", (req, res) => {
  try {
    res.redirect("index.html");
  } catch (error) {
    console.error("Error handling root route:", error);
    res.status(500).send("Internal Server Error");
  }
});

/// Middleware per verificare il ruolo utente
function checkUserRole(roles) {
  return (req, res, next) => {
    const userRole = req.session.user && req.session.user.role; // Assicurati che il ruolo sia memorizzato nella sessione
    if (roles.includes(userRole)) {
      next();
    } else {
      res
        .status(403)
        .send(
          "Accesso negato: non hai i permessi per accedere a questa pagina"
        );
    }
  };
}

// Proteggi le rotte con il middleware
app.get(
  "/delivery/delivery.html",
  checkUserRole(["rider", "admin"]),
  (req, res) => {
    res.sendFile(path.join(__dirname, "views", "delivery.html"));
  }
);

app.get(
  "/order/order.html",
  checkUserRole(["ricevente", "admin"]),
  (req, res) => {
    res.sendFile(path.join(__dirname, "views", "order.html"));
  }
);


app.post('/api/cart/add', async (req, res) => {
  const { productId, quantity, price } = req.body;
  const clienteId = req.session.user.id; // Utilizzo del codice fiscale
  console.log("productId:", productId, "quantity:", quantity, "clienteId:", clienteId)
  try {
      const cart = await Carrello.findOne({ _id: clienteId });
      console.log("Carrello:", cart);
      // Se il carrello non esiste, restituisci un errore
      if (!cart) {
          return res.status(404).json({ message: 'Carrello non trovato' });
      }
        // Trova l'indice del prodotto nel carrello
        const productIndex = cart.prodotti.findIndex(p => p._id.toString() === productId);
        let priceCorrect = price.replace(',', '.');
        let priceNumber = parseFloat(priceCorrect);
        console.log("priceNumber:", priceNumber);
        if (productIndex !== -1) {
            // Prodotto esiste, aggiorna la quantità
            cart.prodotti[productIndex].quantita += quantity;
            cart.prodotti[productIndex].prezzo = priceNumber*quantity;
            console.log("Prodotto esiste, aggiorna la quantità")
        } else {
            // Prodotto non esiste, aggiungilo
            cart.prodotti.push({ productId, quantita: quantity, prezzo: priceNumber});
            console.log("Prodotto non esiste, aggiungilo")
        }
      cart.totale += quantity * priceNumber;  // Aggiorna il totale
      await cart.save();
      res.status(200).json({ success: true, message: 'Prodotto aggiunto al carrello', carrello: cart });
  } catch (error) {
      console.error('Errore aggiunta al carrello:', error);
      res.status(500).json({ success: false, message: 'Errore durante l\'aggiunta al carrello', error });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

