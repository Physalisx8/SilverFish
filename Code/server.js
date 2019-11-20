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

const fileupload = require('express-fileupload');
app.use(fileupload({
    createParentPath: true
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
        res.render('logmain',{name : req.session["sessionVName"]});
    }else{
        res.render('main');
}});

//logmain, die man sieht, wenn man eingeloggt ist. :)
app.get('/logmain', function(req,res){
    if (typeof req.session["sessionVName"] != 'undefined'){
        res.render('logmain',{name : req.session["sessionVName"]});
    }else{
        res.render('main');
}});


//projekt löschen
app.get('/geloscht', function(req,res){
    res.render('Projektgeloscht');
});

app.get('/loschen', function(req,res){
    res.render('Projektsicherloschen');
});

//Ausgabe des Registrieren Formulars
app.get('/signup', function(req, res){
    //definiert die msg für die Fehlermeldung..
    res.render('signup',{msg:""});
});

//Ausgabe des Logins
app.get('/login', function(req,res){
    res.render('login');
});

//LOGOUT
app.get('/logout', function(req,res){
    req.session.destroy(function(err){
});//leider übergibt er die Msg. nicht. Aber wayne.
    res.render('main', {msgLogin: "Successfully logged out."});
});

//Ausgabe eines Projektes
app.get('/Projektanzeigen', function(req,res){
    res.render('Projektanzeigen');
});

//Anlegen eines Projektes
app.get('/Projektanlegen', function(req,res){
    res.render('Projektanlegen', {msgp :""});
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
        res.render('profilanlegen');
    }else{
        res.render('nichteingeloggt')
}});

app.get('/MeinProfilanzeigen',function(req,res){
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

//Ausgabe der AP Projekte
app.get('/AP', function(req, res){
    let sql = 'select * from Projekte'; 
        db2.all(sql,function(err,rows)
        {
            let Projekte = Array();    
            for (let i=0;i<rows.length;i++) {
                let Fach= rows[i].Fach;
                let Name = rows[i].Name;
                if (!((Object.keys(Projekte)).includes(Fach))){
                    Projekte[Fach] = {};
                } 
                if (!((Object.keys(Projekte[Fach])).includes(Name))){
                Projekte[Fach][Name] = Array();
            }
                Projekte[Fach][Name].push(rows[i]);
            }
            res.render('AP',{Projekte:Projekte});
        })
});

app.get('/MGD', function(req, res){
    let sql = 'select * from Projekte'; 
        db2.all(sql,function(err,rows){
            let Projekte = Array();    
            for (let i=0;i<rows.length;i++) {
                let Fach = rows[i].Fach;
                let Name = rows[i].Name;
                if (!((Object.keys(Projekte)).includes(Fach))){
                    Projekte[Fach] = {};
                }
                if(!((Object.keys(Projekte[Fach])).includes(Name))){
                    Projekte[Fach][Name] = Array();
                }
                Projekte[Fach][Name].push(rows[i]);
            }
            res.render('MGD',{Projekte:Projekte});
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
    const name= req.body["name"];
    const password = req.body["password"];

    let sql = `SELECT * FROM user WHERE name="${name}"`; 

    if(name=="" || password=="" ){
        res.render('loginnichtseingegeben');
    }
         db.all(sql, function(err, rows){
             if(err){
                console.error(err);
             }else{
                 //Name nicht in Datenbank vorhanden
                 if( rows.length==0){
                     const variable = "Name";
                     res.render('Loginfehlername', {variable});
                 }else{
                     const dbpassword = rows[0].password;
                     //Passwort und EIngabe im vergleich
                     if(password == dbpassword){
                         req.session["sessionVName"]= rows[0].name;
                         //für den Fall, dass man sich wundert -> req.body bzw req.session macht's möglich, dass dein Benutzername ausgegeben wird!... 
                         res.render('logmain', {name: req.session["sessionVName"]});
                     }else{
                         const variable ='Passwort';
                         res.render('loginfehlerpassword', {variable});
                     }
                 }
             } 
         });
     });

         
  //////* ein Projekt auswählen und das dann anzeigen
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
            }//Name nicht in Datenbank vorhanden
            if(rows.length==0){
                const variable = "Projekt";
                res.render('Projekterror', {variable});
                console.log("VOLL");
            } else{//name doch vorhanden
                res.render('Projektanzeigen',{Projekte:rows});
 }});
});



app.get('/doProjektwahl/:Nummer', function(req,res){
    const Nummer = req.params.Nummer;
   
    

   let sql2 = `SELECT * FROM Projekte WHERE Nummer="${Nummer}"`; 
 
        db2.all(sql2, function(err, rows){
            if(err){
               console.error(err);
            }//Name nicht in Datenbank vorhanden
            if(rows.length==0){
                const variable = "Projekt";
                res.render('Projekterror', {variable});
                console.log("VOLL");
            } else{//name doch vorhanden
                res.render('Projektanzeigen',{Projekte:rows});
 }});
});



function ProjektAusgabefFunktion(Projekt){
    let sql2 = `SELECT * FROM Projekte WHERE Name="${Projekt}"`; 
  
         db2.all(sql2, function(err, rows){
             if(err){
                console.error(err);
             }//Name nicht in Datenbank vorhanden
             if(rows.length==0){
                 const variable = "Projekt";
                 res.render('Projekterror', {variable});
                 console.log("VOLL");
             } else{//name doch vorhanden
                 res.render('Projektanzeigen',{Projekte:rows});
  }});

}

/////* Profiländerungen speichern und dann auf MeinProfil

app.post('/doProfilandern', function(req,res){
    const ProfilName = req.body.ProfilName;
    const ProfilNeuerName= req.body.ProfilNeuerName;
    const ProfilMail=req.body.ProfilMail;
    const ProfilPasswort=req.body.ProfilNeuesPasswort;
    const ProfilAltesPasswort=req.body.ProfilAltesPasswort;



    let sql8 = `SELECT * FROM user WHERE name="${ProfilName}"`; 

         db.all(sql8, function(err, rows){
             if(err){
                console.error(err);
             }else{
                 //Name nicht in Datenbank vorhanden
                 if( rows.length==0){
                     const variable = "Name";
                     res.render('andernerror', {variable});
                 }else{
                     const dbpassword = rows[0].password;
                     if(ProfilAltesPasswort == dbpassword){
                      let sql3 = `UPDATE user SET name= "${ProfilNeuerName}", email="${ProfilMail}", password="${ProfilPasswort}" WHERE name = "${ProfilName}"`;
   
                            if(ProfilName=="" ){
                                 res.render('andernerror',{Profil:rows});
                                }
                             db.get(sql3, function(err, row){
                                 if(err){
                                 console.error(err);
                                }else{
                                 res.render('login', {name : req.session["sessionVName"]});
                                }
                            });
                        }else{
                        const variable ='Passwort';
                        res.render('loginfehlerpassword', {variable});
                    }
                }
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


//Speicherung eines neuen Projektes 
app.post('/doProjektanlegen', function(req,res){
    const ProjektName = req.body.ProjektName;
    const ProjektBeschreibung= req.body.ProjektBeschreibung;
    const ProjektFach=req.body.ProjektFach;
    const ProjektJahr=req.body.ProjektJahr;
    const msgp="Den Namen gibt es bereits"
    const file = req.files.filetoupload;  
    fileName = file.name;
  
    let sql55 = `SELECT * FROM Projekte WHERE Name="${ProjektName}";` //Prüft, ob name de Projektes schon verhanden ist
    let sql15 = `SELECT * FROM Projkete WHERE Bild="${fileName}";`

    db.all(sql55,function(err, rows){
        if(rows.length!=0){
            res.render('registrierungsfehler');
        //checkt das erste Passwort mit dem zweiten gegen und gibt ne Fehlermeldung aus.
        }
    });
   
    
    db2.all(sql15,function(err, rows){
       if(rows.length!=0){
            res.render('projektanlegen', {msgp: msgp});
            console.log(rows.length);

        }else{ 

            if (!req.files || Object.keys(req.files).length === 0) { 
                res.send("Es wurde keine Datei zum hochladen ausgewählt");  //Fehlermeldung 
            } else {
                //let sql222= `INSERT INTO Projekte (Bild) VALUES ("${file.name}"); WHERE Name= "${ProjektName}";`
                         
                file.mv(__dirname + "/Pic/" + file.name, function(err) {  //Ziel Ordner für das Bild
                    fileName = file.name;
                    if(err) {
                        console.error(err);
                        res.send("Ein Fehler ist aufgetreten");
                    } 
                });  
            }
            
            fileName = file.name;
//wenn noch nicht vorhanden erstellt er es ab hier
    let sql10 = `INSERT INTO Projekte (Name, Fach, Beschreibung, Jahr, Bild) VALUES ("${ProjektName}", "${ProjektFach}", "${ProjektBeschreibung}", "${ProjektJahr}", "${fileName}");`
   

    
  if(ProjektFach!="AP" && ProjektFach!="MGD" || ProjektName =="" ){ //Prüft ob wichtige Angaben vorhanden und gültig
       res.render('projektanlegenerror'); 
    }else{
        db2.get(sql10, function(err, row){
            if(err){
               console.error(err);
            }else{
               res.render('Projektangelegt', {name : ProjektName});
           }});
        }}
    });
});


////////////////////////////////////// löscht ein projekt bei korrektem Lösch-Passwort
app.post('/doProjektLoschen', function(req,res){
    res.render('Projektsicherloschen');


    app.post('/doProjektLoschen2', function(req,res){
    const ProjektName =  req.body.name;
       
    let sql3 = `DELETE FROM Projekte WHERE Name= "${ProjektName}";`
  
   
    db2.all(sql3,function(err, rows){
                 if(err){
                     res.render('logmain');
                 }else{
                    res.render('Projektgeloscht', {name : ProjektName});
                 }
    });
});
});


//Auswertung nach der Registrierung
app.post('/doRegister', function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const password2= req.body.pw2;
    const msg="Passwörter stimmen nicht überein";


let sql5 = `SELECT * FROM user WHERE name="${name}";` //Prüft, ob name schon verhanden ist
db.all(sql5,function(err, rows){
    if(password==""|| name ==""){
        res.render('loginnichtseingegeben');
        
    }else if(rows.length!=0){
        res.render('registrierungsfehler');
        console.log(rows.length);
    //checkt das erste Passwort mit dem zweiten gegen und gibt ne Fehlermeldung aus.
    }else if(password != password2){
        res.render("signup", {msg: msg});        
        } else{                                          //wenn nicht, legt er den eintrag an
        let sql = `INSERT INTO user (name, email, password) VALUES ("${name}", "${email}", "${password}");`
        db.run(sql, function(err) {
            if (err) { 
                console.error(err)
                res.render('registrierungsfehler');
            } else {
                res.render('benutzerangelegt', { name: name});
        }});
    }})
});




 //Auswertung von der Fileupload in server
/*app.post('/fileupload', function (req, res) {
  
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
*/
/////////////////*FUNKTIONEN*///////////////////////////////
/* neue js. datei anlegen*/