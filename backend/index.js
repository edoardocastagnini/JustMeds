const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config(); // console.log(process.env.SUPER_SECRET);à
const Ordine = require("./models/Ordine");
// Middleware per il parsing del corpo delle richieste
app.use(express.json()); // Per supportare il corpo delle richieste in formato JSON
app.use(express.urlencoded({ extended: true })); // Per supportare il corpo delle richieste URL-encoded

app.use(express.static("../frontend"));
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

const tokenChecker = require("./middlewares/tokenChecker");

const drugRoutes = require("./order/farmaci");
app.use("/api", drugRoutes);

// Importa e utilizza il router di contattaci.js
const contattaciRouter = require("./form_request/contattaci");
app.use('/api', contattaciRouter);

const User = require("./models/User");
const Carrello = require("./models/Carrello");

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

    //creo il carrello se l'utente è un cliente
    if(user.type === "ricevente"){
      const cart = new Carrello({
        clienteId: user._id, // Utilizzo del codice fiscale
        prodotti: [],
        totale: 0
      });
      await cart.save();
      console.log("Cart created successfully");
    }


    setTimeout(() => {
      res.redirect("../auth/SignupSuccess.html");
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
    res.redirect("../frontend/index.html");
  } catch (error) {
    console.error("Error handling root route:", error);
    res.status(500).send("Internal Server Error");
  }
});

/// Middleware per verificare il ruolo utente
function checkUserRole(roles) {
  return (req, res, next) => {
    const userRole = req.session.user && req.session.user.type; // Assicurati che il ruolo sia memorizzato nella sessione
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
  "../frontend/delivery/delivery.html",
  checkUserRole(["rider", "admin"]),
  (req, res) => {
    res.sendFile(path.join(__dirname, "views", "delivery.html"));
  }
);

app.get(
  "../frontend/order/order.html",
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

// ENDPOINT PER VISUALIZZAZIONE DEL CARRELLO
app.get('/api/cart', isAuthenticated, async (req, res) => {
  const clienteId = req.session.user.id; // Assume che l'ID dell'utente sia salvato nella sessione al login
  console.log("clienteId:", clienteId)
  try {
      // Popola i dettagli del prodotto nel carrello usando il modello Drug
      const cart = await Carrello.findOne({ _id: clienteId })
          .populate({
              path: 'prodotti._id',
              model: 'Drug',
              select: 'Farmaco PrezzoRiferimentoSSN'  // Seleziona solo i campi necessari per il frontend
          });

      if (!cart || cart.prodotti.length === 0) {
          return res.status(200).json({ success: true, items: [] });
      }

      // Mappa gli articoli del carrello per il frontend
      const items = cart.prodotti.map(item => ({
          id: item.productId._id,
          name: item.productId.Farmaco,         // Nome del farmaco
          quantity: item.quantita,              // Quantità
          price: item.prezzo                   // Prezzo per unità
      }));

      res.status(200).json({ success: true, items: items });
  } catch (error) {
      console.error('Errore nel recuperare il carrello:', error);
      res.status(500).json({ success: false, message: 'Errore durante il recupero del carrello', error });
  }
});

// RIMOZIONE ARTICOLO DAL CARRELLO
app.post('/api/cart/remove', isAuthenticated, async (req, res) => {
  const { id } = req.body;
  const clienteId = req.session.user.id;
  try {
      const cart = await Carrello.findOne({ _id: clienteId });
      if (!cart) {
          return res.status(404).json({ message: 'Carrello non trovato' });
      }

      // Rimuovi l'articolo dal carrello
      cart.prodotti = cart.prodotti.filter(item => item.productId.toString() !== id);
      cart.totale = cart.prodotti.reduce((acc, item) => acc + item.prezzo, 0);
      await cart.save();

      res.json({ success: true, message: 'Articolo rimosso dal carrello' });
  } catch (error) {
      console.error('Errore nella rimozione dell\'articolo:', error);
      res.status(500).json({ success: false, message: 'Errore durante la rimozione dell\'articolo', error });
  }
});


app.post('/api/cart/change', isAuthenticated, async (req, res) => {
  const { productId, change } = req.body; // change è il delta, può essere 1 o -1
  const userId = req.session.user.id;

  try {
      const cart = await Carrello.findOne({ _id: userId });
      if (!cart) {
          return res.status(404).json({ success: false, message: 'Carrello non trovato' });
      }

      const itemIndex = cart.prodotti.findIndex(item => item.productId.toString() === productId);

      if (itemIndex > -1) {
          cart.prodotti[itemIndex].quantita += change;
          if (cart.prodotti[itemIndex].quantita < 1) {
              cart.prodotti.splice(itemIndex, 1);
          }
          cart.totale += change * cart.prodotti[itemIndex].prezzo;
          await cart.save();
          res.json({ success: true, message: 'Quantità aggiornata', cart: cart });
      } else {
          res.status(404).json({ success: false, message: 'Prodotto non trovato nel carrello' });
      }
  } catch (error) {
      console.error('Errore nella modifica della quantità nel carrello:', error);
      res.status(500).json({ success: false, message: 'Errore tecnico nel modificare la quantità' });
  }
});

// VISUALIZZAZIONE ORDINI
// Endpoint per recuperare tutti gli ordini
app.get("/api/orders", isAuthenticated, async (req, res) => {
  try {
    const orders = await Ordine.find().populate('prodotti._id');
    res.json(orders);
  } catch (error) {
    console.error("Errore nel recuperare gli ordini:", error);
    res.status(500).json({ success: false, message: "Errore durante il recupero degli ordini" });
  }
});

// Endpoint per aggiornare lo stato dell'ordine
app.post('/api/orders/:id/accept', async (req, res) => {
  const orderId = req.params.id;
  console.log(`POST /api/orders/${orderId}/accept`);

  try {
    // Recupera l'ordine dal database utilizzando il modello Ordine
    const order = await Ordine.findById(orderId);

    if (order) {
      // Aggiorna lo stato dell'ordine
      order.stato = 'attesa';
      // Salva l'ordine aggiornato nel database
      await order.save();
      res.status(200).json({ message: 'Ordine accettato' });
    } else {
      res.status(404).json({ message: 'Ordine non trovato' });
    }
  } catch (error) {
    console.error('Errore durante l\'accettazione dell\'ordine:', error);
    res.status(500).json({ message: 'Errore durante l\'accettazione dell\'ordine', error });
  }
});

// Endpoint per annullare l'accettazione dell'ordine
app.post('/api/orders/:id/cancel', async (req, res) => {
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




app.listen(3000, () => {
  console.log("Server running on port 3000");
});

