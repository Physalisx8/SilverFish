/*Installation und Initialisierung aller Packages und Module (express, body-parser, ejs, sqlite, cookie-parser, express-session)*/
var formidable = require('formidable');
var fs = require('fs');

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

///Datenbank für Projekte angesetzt
let db2 = new sqlite3.Database('datenbanken.db', function(err) {
    if (err) { 
        console.error(err); 
    } else {
        console.log("Verbindung zur Datenbank der Projekte wurde auch hergestellt.")
    }
});



///////////////////*AUSGABEN*///////////////////////

/*Neues Feature: Diebstahlschutz. Du kummst hier net rein! Wenn man die URL kennt, wird man trotzdem nur auf die Main geleitet. (:
  i: sessionVName speichert den Benutzernamen solange er eingeloggt ist. Bei Serverneustart wird's resettet. */

app.get('/main', function(req,res){
    if (typeof req.session["sessionVName"] != 'undefined'){
        res.render('logmain');
    }else{
        res.render('main');
}});

//logmain, die man sieht, wenn man eingeloggt ist. :)
app.get('/logmain', function(req,res){
    if (typeof req.session["sessionVName"] != 'undefined'){
        res.render('logmain')
    }else{
        res.render('main')
}});


//Ausgabe des Registrieren Formulars
app.get('/signup', function(req, res){
    res.render('signup');
});

//Ausgabe der AP Projekte

app.get('/AP', function(req, res){
    let sql = 'select * from Projekte'; 
        db2.all(sql,function(err,rows)
        {
            let Projekte = Array();    
            for (let i=0;i<rows.length;i++) {
                let Name = rows[i].Name;
                if (!((Object.keys(Projekte)).includes(Name))){
                    Projekte[Name] = Array();
                }
               /* if(!((Object.keys(Projekte[Fach])).includes(Jahr))){
                    Projekte[Fach][Jahr] = Array();
                }*/
                Projekte.push(rows[i]);
            }
            res.render('AP',{Projekte:Projekte});
        })
});

app.get('/MGD', function(req, res){
    res.render('MGD');
});

app.get('/MGD', function(req, res){
    res.render('MGD');
});

//Ausgabe des Logins
app.get('/login', function(req,res){
    res.render('login');
});

//Ausgabe Über uns
app.get('/aboutus', function(req, res){
    res.render('aboutus');
});

//Ausgabe Projektsuche + Diebstahlschutz
app.get('/projname', function(req,res){
    if (typeof req.session["sessionVName"] != 'undefined'){
        res.render('projname')
    }else{
        res.render('nichteingeloggt')
}});

  ///////////PROFIL AUSGABE///////////
//mein Profil - Diebstahlschutz
app.get('/MeinProfil',function(req,res){
    if (typeof req.session["sessionVName"] != 'undefined'){
        res.render('MeinProfil')
    }else{
        res.render('nichteingeloggt')
}});

//Profil anlegen - Diebstahlschutz
app.get('/profilanlegen', function(req,res){
    if (typeof req.session["sessionVName"] != 'undefined'){
        res.render('profilanlegen')
    } else{
        res.render('nichteingeloggt')
}});
 
//profiländerung ausgeben
app.get('/profilandern',function(req,res){
    res.render('profilandern');
})

//FächerJahre Übersicht - Diebstahlschutz
app.get('/FaecherJahre', function(req,res){
    //if (typeof req.session.name !== 'undefined'){
        let sql = 'select * from Projekte'; 
        db2.all(sql,function(err,rows){
            let Projekte = Array();    
            for (let i=0;i<rows.length;i++) {
                let Fach = rows[i].Fach;
                let Jahr = rows[i].Jahr;
                if (!((Object.keys(Projekte)).includes(Fach))){
                    Projekte[Fach] = {};
                }
                if(!((Object.keys(Projekte[Fach])).includes(Jahr))){
                    Projekte[Fach][Jahr] = Array();
                }
                Projekte[Fach][Jahr].push(rows[i]);
            }
            res.render('FaecherJahre',{Projekte:Projekte});
        })
        
        
/* }
else {
    res.send('du bist icht eingeloggt');
} */
});

app.get('/AP', function(req,res){
  
        let sql = 'select * from Projekte'; 
        db2.all(sql,function(err,rows){
            let Projekte = Array();    
            for (let i=0;i<rows.length;i++) {
                let Fach = rows[i].Fach;
                let Jahr = rows[i].Jahr;
                if (!((Object.keys(Projekte)).includes(Fach))){
                    Projekte[Fach] = {};
                }
                if(!((Object.keys(Projekte[Fach])).includes(Jahr))){
                    Projekte[Fach][Jahr] = Array();
                }
                Projekte[Fach][Jahr].push(rows[i]);
            }
            res.render('AP',{Projekte:Projekte});
        })
    });
        
       

//Open the Fileuploading html
app.get('/Files', function(req,res){
    res.sendfile(__dirname + "/Files.html");
  });
  
//Alle die Projektjahren anzeigen
app.get('/Jahren', function(req,res){
    res.render('Jahren');
});
 


///////////////////*AUSWERTUNGEN*/////////////////////////
//Post Auswertung des logins

app.post('/logmain', function(req,res){
    //das in ["name"] geändert, da das dann mit dem req.body funktioniert und man sich (leider nur einmalig) den Namen ausgeben lassen kann.
    const name= req.body["name"];
    const password = req.body["password"];

    let sql = `SELECT * FROM user WHERE name="${name}"`; 

    if(name=="" || password=="" ){
        res.render('loginnichtseingegeben');
    }
         db.all(sql, function(err, rows){
             if(err){
                console.error(err);
             }   
             else{
                 //Name nicht in Datenbank vorhanden
                 if(rows.length==0){
                     const variable = "Name";
                     res.render('Loginfehlername', {variable});
                 }
                 else{
                     const dbpassword = rows[0].password;
                     //Passwort und EIngabe im vergleich
                     if(password == dbpassword){
                         req.session["sessionVName"]= rows[0].name;
                         //für den Fall, dass man sich wundert -> req.body bzw req.session macht's möglich, dass dein Benutzername ausgegeben wird!... 
                         //leider nur einmal xD... -> FIX needed!
                         res.render('logmain', req.session);
                     }else{
                         const variable ='Passwort';
                         res.render('loginfehlerpassword', {variable});
                     }
                 }
             }
             
         });
     });

         
  //////* Ich versuche ein Projekt auszuwählen und das dann anzuzeigen
app.post('/doProjektwahl', function(req,res){
    const Projekt = req.body.Projektname;
    
 

   let sql2 = `SELECT * FROM Projekte WHERE Name="${Projekt}"`; 
   
   if(Projekt==""){
       res.render('Projekterror');
       console.log("LEER");
   }
        db2.all(sql2, function(err, rows){
            if(err){
               console.error(err);
               
            }   
         
                //Name nicht in Datenbank vorhanden
                if(rows.length==0){
                    const variable = "Projekt";
                    res.render('Projekterror', {variable});
                    console.log("VOLL");
                } else{//name doch vorhanden
               
                res.render('Projektanzeigen',{Projekte:rows});
 }});
});


/////* Profiländerungen speichern und dann auf MeinProfil

app.post('/doProfilandern', function(req,res){
    const ProfilName = req.body.ProfilName;
    const ProfilNeuerName= req.body.ProfilNeuerName;
    const ProfilMail = req.body.ProfilMail;
    const ProfilProjekte= req.body.ProfilProjekte;
    const ProfilZutun= req.body.ProfilZutun;
    const ProfilStudiengang= req.body.ProfilStudiengang;
 

    let sql3 = `UPDATE Profil SET (ProfilName, ProfiilMail, ProfilProjekte,ProfilZutun, ProfilStudiengang) VALUES ("${ProfilNeuerName}", "${ProfilMail}", "${ProfilProjekte}", "${ProfilZutun}",${Profil}) WHERE ProfilName==("${ProfilName}");`
   
   if(ProfilName=="" ){
       res.render('MeinProfil',{Profil:rows});
   }
        db2.all(sql3, function(err, rows){
            if(err){
               console.error(err);
            }   
           
                //Name nicht in Datenbank vorhanden
                if(rows.length==0){
                    console.log("Noch nicht drin")
                    res.render('loginfehlername');
                }
                else{
                    res.render('MeinProfil',{Profil:rows});
                    }
                    
                
            
            
        });
    });
            
        







////* Der Anfangsversuch davon, eine auswahl von fächern zu treffen und dann zu den möglichen Jahren weitergeleitet zu werden.
app.post('/', function(req,res){
    const fach = req.body.fach;

    let sql = `SELECT * FROM Projekte WHERE fach="${fach}"`;
    db.get(sql, function(err, row){
        //Session Variablen sollen in die loginresponse.ejs übergeben wrden
        res.render('FaecherJahre', {
            fach: req.session.fach,
           
        });
    });
});

//Auswertung nach der Registrierung
app.post('/doRegister', function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
    //SQL Befehl um einen neuen Eintrag der Tabelle user hinzuzufügen
    

    let sql5= `INSERT INTO Profil (ProfilName,ProfilNeuerName, ProfilMail, ProfilProjekte,ProfilZutun, ProfilStudiengang, ProfilUser) VALUES ("${name}", "", "", "", "","", "${name}");`
   
db2.run(sql5, function(err) {
    if (err) { 
        console.error(err)
        app.post('/registrierungsfehler');
    }
    else {
        res.render('benutzerangelegt');
    }
});
let sql = `INSERT INTO user (name, email, password) VALUES ("${name}", "${email}", "${password}");`
db.run(sql, function(err) {
        if (err) { 
            console.error(err)
            app.post('/registrierungsfehler');
        }
        else {
            res.render('benutzerangelegt');
        }
    });
});    


 //Auswertung von der Fileupload in server
 app.post('/fileupload', function (req, res) {
  
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = 'C:/Users/monav/Desktop/Uni/SilverFish/Code/public/public' + files.filetoupload.name;  //Name(Präfix) und speicher verzeichnis von Bild
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
 });
});

/////////////////*FUNKTIONEN*///////////////////////////////
/* neue js. datei anlegen*/