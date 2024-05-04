const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
require('dotenv').config();    // Carica le variabili d'ambiente dal file .env
const tokenChecker = require('./public/middlewares/tokenChecker');



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

const User = require('./public/models/User'); 


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
const jwt = require('jsonwebtoken');

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Confronto diretto delle password in chiaro (NON raccomandato)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, process.env.SUPER_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token: 'Bearer ' + token });
        // Dopo aver ottenuto una risposta positiva dal server con il token
        const token1 = response.data.token;  // Assicurati di utilizzare il percorso corretto per il token nella risposta
        localStorage.setItem('token', token1);

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});





app.get("/", (req, res) => {
    res.redirect('index.html');
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
