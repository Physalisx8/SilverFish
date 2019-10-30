/*Installation und Initialisierung aller Packages und Module (express, body-parser, ejs, sqlite, cookie-parser, express-session)*/

const express = require('express');
const app =  express();
const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.engine('.ejs', require('ejs').__express);
app.set('view engine','ejs');

app.listen(3000, function(){
    console.log('listening on 3000');
});

//Initialisierung des Cookie Parsers
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//initialisierung von express-sessions
const session = require('express-session');
app.use(session({
    secret: "example",
    resave: false,
    saveUninitialized: true
}));


/////////////////* FREIGABEN *///////////////////

//Freigabe des public Ordners
app.use(express.static(__dirname + '/public'));



//////////////////////* DATENBANKEN *//////////////////////
// Verbindung zur Datenbank
const sqlite3 = require('sqlite3').verbose();

//Datenbank fürs Login aufgesetzt
let db = new sqlite3.Database('login.db', function(err) {
    if (err) { 
        console.error(err); 
    } else {
        console.log("Verbindung zur Datenbank wurde erfolgerich hergestellt.")
    }
});



///////////////////*AUSGABEN*///////////////////////
app.get('/main', function(req,res){
    res.render('main');
});
app.get('/MeinProfil',function(req,res){
    res.render('MeinProfil');
})

//Ausgabe des Registrieren Formulars
app.get('/signup', function(req, res){
    res.render('signup');
});

//Ausgabe des Logins
app.get('/login', function(req,res){
    res.render('login');
});

//Ausgabe aboutus
app.get('/aboutus', function(req, res){
    res.render('aboutus');
});

//Ausgabe Profil
app.get('/MeinProfil', function(req,res){
    res.render('MeinProfil');
});


//Profil anlegen
app.get('/profilanlegen', function(req,res){
    res.render('profilanlegen');
});

app.get('/FaecherJahre', function(req,res){
    if (typeof req.session.name !== 'undefined'){
    res.render('FaecherJahre');
}
else {
    res.send('du bist icht eingeloggt');
}});



///////////////////*AUSWERTUNGEN*/////////////////////////
//Post Auswertung des logins
app.post('/doLogin', function(req,res){
    const name = req.body.name;
    const password = req.body.password;

    let sql = `SELECT * FROM user WHERE name="${name}"`;
    db.get(sql, function(err, row){
        //wir wollen username&email in ner Session Variable speichern
        req.session.name = row.name;
        //Session Variablen sollen in die loginresponse.ejs übergeben wrden
        res.render('main', {
            name: req.session.name,
            password: req.session.name 
           
        });
    });
});
    

////* Der Anfangsversuch davon, eine auswahl von fächern zu treffen und dann zu den möglichen Jahren weitergeleitet zu werden.
app.post('/', function(req,res){
    const fach = req.body.fach;

    let sql = `SELECT * FROM Projekte WHERE fach="${fach}"`;
    db.get(sql, function(err, row){
        //Session Variablen sollen in die loginresponse.ejs übergeben wrden
        res.render('FächerJahre', {
            fach: req.session.fach,
           
        });
    });
});

//Auswertung nach der Registrierung
app.post('/doRegister', function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    let hash = bcrypt.hashSync(password, row.passoword);
    //SQL Befehl um einen neuen Eintrag der Tabelle user hinzuzufügen
    let sql = `INSERT INTO user (name, email, password) VALUES ("${name}", "${email}", "${hash}");`
    db.run(sql, function(err) {
        if (err) { 
            console.error(err)
        }if(bcrypt.compareSync(password, row.password)){
            res.render('hello',{username:row.name, email: row.email});
        }
        else {
            res.send('Benutzer wurde angelegt');
        }
    });
   
});

/////////////////*FUNKTIONEN*///////////////////////////////
/* neue js. datei anlegen*/