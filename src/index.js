
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const drugRoutes = require('./public/order/farmaci'); // Il percorso deve essere corretto


// Usare il router dei farmaci
app.use(drugRoutes);

app.use(session({
    secret: 'supersecret', // Chiave segreta utilizzata per firmare il cookie di sessione (puoi generare una stringa casuale)
    resave: false, // Imposta su false per evitare il salvataggio della sessione se non ci sono modifiche
    saveUninitialized: false, // Imposta su false per evitare di salvare sessioni vuote
    cookie: { secure: false } // Configura le opzioni del cookie, ad esempio secure: true per richiedere una connessione HTTPS
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
    var type = req.body.type; //valore del pulsante radio selezionato

    var data = {
        "_id": CF,
        "nome": nome,
        "cognome": cognome,
        "email": email,
        "password": password,
        "dataDiNascita": dataDiNascita,
        "paese": paese,
        "città": città,
        "via": via,
        "type": type
    };



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
            
             // Se l'autenticazione ha successo, impostiamo i dati della sessione
            req.session.user = {
                CF: req.body.CF, // Codice fiscale
                nome: req.body.nome // Nome utente
             // Altri dati dell'utente...
  };

            if (user.type === 'rider') {
                res.redirect('/delivery/delivery.html');
            }
            if (user.type === 'ricevente') {
                res.redirect('/order/order.html');
            } 
            if (user.type === 'admin') {
                res.redirect('/admin/admin.html');
            } 
        } else {
           
            res.redirect('/loginFail.html');
        }
    });
});

app.get('/profile', (req, res) => {
    if (req.session && req.session.user) {
        const { email, nome, CF } = req.session.user;
        // Utilizza le informazioni dell'utente per eseguire operazioni desiderate
        res.send(`Benvenuto ${nome}, il tuo indirizzo email è ${email} e il tuo codice fiscale è ${CF}`);
    } else {
        res.redirect('/login'); // Reindirizza se l'utente non è autenticato
    }
});




module.exports = router;
