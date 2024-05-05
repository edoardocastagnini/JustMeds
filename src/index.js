const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
require('dotenv').config();    // console.log(process.env.SUPER_SECRET);
// Middleware per il parsing del corpo delle richieste
app.use(express.json()); // Per supportare il corpo delle richieste in formato JSON
app.use(express.urlencoded({ extended: true })); // Per supportare il corpo delle richieste URL-encoded

app.use(express.static('public'));


const tokenChecker = require('./public/middlewares/tokenChecker');

const drugRoutes = require('./public/order/farmaci'); 
app.use('/api', drugRoutes);


const User = require('./public/models/User'); 



// La tua stringa di connessione Atlas
const DbURI = 'mongodb+srv://adminuser:adminuser@justmedsdata.d6avjw7.mongodb.net/Data?retryWrites=true&w=majority&appName=JustMedsData';

mongoose.connect(DbURI)
    .then(() => console.log('MongoDB Atlas connected'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

app.set('view engine', 'ejs');
app.use(morgan('dev'));




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
    console.log("Received login request", req.body);
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        console.log("User found:", user);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, process.env.SUPER_SECRET, { expiresIn: '1h' });
        console.log("Token:", token);
        res.json({ success: true, token: 'Bearer ' + token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send(err.message);
    }
});







app.get("/", (req, res) => {
    try {
        res.redirect('index.html');
    } catch (error) {
        console.error('Error handling root route:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
