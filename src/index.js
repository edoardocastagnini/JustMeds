const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();


// Middleware per il parsing del corpo delle richieste POST
app.use(express.json()); // Supporto per il corpo delle richieste in formato JSON
app.use(express.urlencoded({ extended: true })); // Supporto per il corpo delle richieste URL-encoded


// La tua stringa di connessione Atlas
const DbURI = 'mongodb+srv://adminuser:adminuser@justmedsdata.d6avjw7.mongodb.net/Data?retryWrites=true&w=majority&appName=JustMedsData';

mongoose.connect(DbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Atlas connected'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(morgan('dev'));

const drugRoutes = require('./public/order/farmaci'); // Verifica il percorso
app.use(drugRoutes);

// Definisci lo schema e il modello per gli utenti
const userSchema = new mongoose.Schema({
    nome: String,
    cognome: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dataDiNascita: Date,
    CF: String,
    paese: String,
    città: String,
    via: String,
    type: String
});

const User = mongoose.model('User', userSchema, 'users');

// Ora usa User per interagire con la collezione users
app.post('/sign_up', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        console.log("Record inserted successfully");
        setTimeout(() => {
            res.redirect('login.html');
        }, 2000);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Login request body:", req.body);
    
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            console.log("User with email not found:", email);
            return res.redirect('/loginFail.html');
        }

        console.log("User found in database with email:", email, "User object:", user);

        // Qui aggiungi il controllo della password, considerando se è criptata o meno
        if (user.password === password) {
            console.log("Password matches. User authenticated successfully.");
            return res.redirect('/order/order.html');
        } else {
            console.log("Password does not match.");
            return res.redirect('/loginFail.html');
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send(err.message);
    }
});


app.get("/", (req, res) => {
    res.redirect('index.html');
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
