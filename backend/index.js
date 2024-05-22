const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require('path');
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware per il parsing del corpo delle richieste
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Middleware per i log delle richieste
app.use(morgan("dev"));

// Connessione al database
const DbURI = "mongodb+srv://adminuser:adminuser@justmedsdata.d6avjw7.mongodb.net/Data?retryWrites=true&w=majority&appName=JustMedsData";
mongoose
  .connect(DbURI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Modelli
const User = require("./models/User");
const Carrello = require("./models/Carrello");
const UserFarmacia = require("./models/UserFarmacia");

// Middleware di autenticazione
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send({ success: false, message: "Not authenticated" });
  }
}

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

// Importare e utilizzare i router
const adminRoutes = require("../backend/admin/admin");
app.use('/api/admin', adminRoutes);

const tokenChecker = require("./middlewares/tokenChecker");
const drugRoutes = require("./order/farmaci");
app.use("/api", drugRoutes);

const farmaciaRoutes = require("../backend/farmacia/farmacia");
app.use('/api', farmaciaRoutes);

const contattaciRouter = require("./form_request/contattaci");
app.use('/api', contattaciRouter);

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

// Rotte per il carrello
app.post('/api/cart/add', isAuthenticated, async (req, res) => {
  const { productId, quantity, price } = req.body;
  const clienteId = req.session.user.id;
  console.log("productId:", productId, "quantity:", quantity, "clienteId:", clienteId);
  try {
    const cart = await Carrello.findOne({ _id: clienteId });
    console.log("Carrello:", cart);
    if (!cart) {
      return res.status(404).json({ message: 'Carrello non trovato' });
    }

    const productIndex = cart.prodotti.findIndex(p => p._id.toString() === productId);
    let priceCorrect = price.replace(',', '.');
    let priceNumber = parseFloat(priceCorrect);
    console.log("priceNumber:", priceNumber);

    if (productIndex !== -1) {
      cart.prodotti[productIndex].quantita += quantity;
      cart.prodotti[productIndex].prezzo = priceNumber * quantity;
      console.log("Prodotto esiste, aggiorna la quantità");
    } else {
      cart.prodotti.push({ productId, quantita: quantity, prezzo: priceNumber });
      console.log("Prodotto non esiste, aggiungilo");
    }

    cart.totale += quantity * priceNumber;
    await cart.save();
    res.status(200).json({ success: true, message: 'Prodotto aggiunto al carrello', carrello: cart });
  } catch (error) {
    console.error('Errore aggiunta al carrello:', error);
    res.status(500).json({ success: false, message: 'Errore durante l\'aggiunta al carrello', error });
  }
});

app.get('/api/cart', isAuthenticated, async (req, res) => {
  const clienteId = req.session.user.id;
  console.log("clienteId:", clienteId);
  try {
    const cart = await Carrello.findOne({ _id: clienteId })
      .populate({
        path: 'prodotti._id',
        model: 'Drug',
        select: 'Farmaco PrezzoRiferimentoSSN'
      });

    if (!cart || cart.prodotti.length === 0) {
      return res.status(200).json({ success: true, items: [] });
    }

    const items = cart.prodotti.map(item => ({
      id: item.productId._id,
      name: item.productId.Farmaco,
      quantity: item.quantita,
      price: item.prezzo
    }));

    res.status(200).json({ success: true, items: items });
  } catch (error) {
    console.error('Errore nel recuperare il carrello:', error);
    res.status(500).json({ success: false, message: 'Errore durante il recupero del carrello', error });
  }
});

app.post('/api/cart/remove', isAuthenticated, async (req, res) => {
  const { id } = req.body;
  const clienteId = req.session.user.id;
  try {
    const cart = await Carrello.findOne({ _id: clienteId });
    if (!cart) {
      return res.status(404).json({ message: 'Carrello non trovato' });
    }

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
  const { productId, change } = req.body;
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


app.get('/api/user/address', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;  // Assicurati che l'ID utente sia salvato nella sessione al login
  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "Utente non trovato" });
      }
      res.json({
          nome: user.nome,
          cognome: user.cognome,
          via: user.via,
          città: user.città,
          paese: user.paese
      });
  } catch (error) {
      console.error('Errore nel recuperare i dati utente:', error);
      res.status(500).json({ message: 'Errore interno del server', error });
  }
});


app.get('/api/cart/details', isAuthenticated, async (req, res) => {
  const clienteId = req.session.user.id;
  try {
      const cart = await Carrello.findOne({ _id: clienteId }).populate('prodotti._id');
      if (!cart) {
          return res.status(404).json({ message: 'Carrello non trovato' });
      }
      const items = cart.prodotti.map(item => ({
          nome: item._id.Farmaco, // Assumendo che 'nome' sia un campo del documento a cui il prodotto è collegato
          quantità: item.quantita,
          prezzo: item.prezzo
      }));
      res.json({ items, totalPrice: cart.totale });
  } catch (error) {
      console.error('Errore nel recuperare i dettagli del carrello:', error);
      res.status(500).json({ message: 'Errore interno del server', error });
  }
});

const Ordine = require("./models/Ordine");


app.post('/api/order/create', isAuthenticated, async (req, res) => {
  const userId = req.session.user.id; // ID utente dalla sessione
  const userAddress = await User.findById(userId).select('nome cognome via città paese');
  const cart = await Carrello.findOne({ _id: userId }).populate('prodotti._id');
  const IDfarmacia = req.body.farmaciaId;
  const IndirizzoFarmacia = await ListaFarmacie.findById(IDfarmacia).select('INDIRIZZO CAP PROVINCIA');
  console.log("IndirizzoFarmacia:", IndirizzoFarmacia);

  if (!cart || cart.prodotti.length === 0) {
      return res.status(400).json({ success: false, message: 'Il carrello è vuoto.' });
  }

  try {
      const newOrder = new Ordine({
          utenteID: userId,
          farmaciaID: IDfarmacia,
          riderID: null,
          secretcode: Math.floor(1000 + Math.random() * 9000).toString(),
          prodotti: cart.prodotti.map(item => ({
              _id: item._id._id,
              quantita: item.quantita,
              prezzo: item.prezzo
          })),
          indirizzoCliente: {
              nome: userAddress.nome,
              cognome: userAddress.cognome,
              via: userAddress.via,
              città: userAddress.città,
              paese: userAddress.paese
          },
          indirizzoFarmacia: {
              via: IndirizzoFarmacia.INDIRIZZO,
              cap: IndirizzoFarmacia.CAP,
              provincia: IndirizzoFarmacia.PROVINCIA
          },
          stato: 'inviato'
          
      });

      await newOrder.save();

      // Pulire il carrello dopo l'ordine
      cart.prodotti = [];
      cart.totale = 0;
      await cart.save();

      res.json({ success: true, message: 'Ordine creato con successo' });
  } catch (error) {
      console.error('Errore nella creazione dell\'ordine:', error);
      res.status(500).json({ success: false, message: 'Errore tecnico nella creazione dell\'ordine' });
  }
});


const ListaFarmacie = require("./models/ListaFarmacie"); 
app.get('/api/farmacie', async (req, res) => {
  try {
      const farmacie = await ListaFarmacie.find({});
      res.json({ success: true, farmacie: farmacie });
  } catch (error) {
      console.error('Errore nel recuperare la lista delle farmacie:', error);
      res.status(500).json
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);



});
