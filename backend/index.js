const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config(); // console.log(process.env.SUPER_SECRET);
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

const drugRoutes = require("./order/order_cart");
app.use("/api", drugRoutes);

// Importa e utilizza il router di contattaci.js
const contattaciRouter = require("./form_request/contattaci");
app.use('/api', contattaciRouter);

const clientRouter = require("./client_account/client");
app.use('/api',clientRouter);

const checkoutRouter = require("./order/checkout");
app.use('/api',checkoutRouter);

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


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

