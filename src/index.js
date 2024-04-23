const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const drugRoutes = require('./public/order/farmaci'); // Il percorso deve essere corretto


// Usare il router dei farmaci
app.use(drugRoutes);

app.use(session({
    secret: '2024', // Chiave segreta per firmare l'ID di sessione, sostituiscila con una chiave sicura
    resave: false,
    saveUninitialized: true
}));


app.use(bodyParser.json())
app.use(express.static("public"))
app.use(bodyParser.urlencoded({
    extended: true
}))
mongoose.connect('mongodb://localhost:27017/Database')
var db = mongoose.connection
db.on('error', () => console.log("Error in connecting to database"))
db.once('open', () => console.log("Connected to database"))

app.post('/sign_up', (req, res) => {
    var nome = req.body.nome;
    var cognome = req.body.cognome;
    var email = req.body.email;
    var password = req.body.password;
    var dataDiNascita = req.body.dataDiNascita;
    var CF = req.body.CF;
    var paese = req.body.paese;
    var città = req.body.città;
    var via = req.body.via;
    var type = req.body.type; //value of the selected radio button (pallino)

    var data = {
        "nome": nome,
        "cognome": cognome,
        "email": email,
        "password": password,
        "dataDiNascita": dataDiNascita,
        "CF": CF,
        "paese": paese,
        "città": città,
        "via": via,
        "type": type
    }

    db.collection('users').insertOne(data, (err, collection) => {
        if (err) {
            throw err;
        }
        console.log("Record inserted successfully");

        // Delay redirection based on account type
        setTimeout(() => {
           res.redirect('login.html');
        }, 2000); // Delay for 2 seconds (2000 milliseconds)
    });
});

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    db.collection('users').findOne({ email: email, password: password }, (err, user) => {
        if (err) {
            throw err;
        }
        if (user) {
            // Utente trovato nel database, reindirizza in base al tipo di account
            if (user.type === 'rider') {
                res.redirect('/delivery/delivery.html');
            }
            if (user.type === 'ricevente') {
                res.redirect('/order/order.html');
            } 
        } else {
           
            res.redirect('/loginFail.html');
        }
    });
});




app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": "*"
    })
    return res.redirect('index.html');
}).listen(3000);

console.log("Listening on port 3000")