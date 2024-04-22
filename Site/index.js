var express = require('express');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://localhost:27017/Database')

var db = mongoose.connection;
db.on('error', () => { console.log('Error in Connecting to Database') });
db.once('open', () => {
    console.log('Connected to Database');
});

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
    var type = req.body.type;

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
        console.log("Record Inserted Successfully");
    });

    return res.redirect('./loginOK.html');

    /*
    if(type == 1) { // se è un rider
        return res.redirect('./delivery/delivery.html');
    }
    if(type == 2) { // se è un ricevente
        return res.redirect('./order/order.html');
    }*/
    
    
})

app.get('/', (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
}).listen(3000);

console.log('Server running at http://localhost:3000/');