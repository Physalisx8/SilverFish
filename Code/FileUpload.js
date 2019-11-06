// First install: bopdy-parser, formidable, express
const express = require("express");
const app = express();

var formidable = require('formidable');
var fs = require('fs');

//Open the Fileuploading html
app.get('/Files', function(req,res){
  res.sendfile(__dirname + "/Files.html");
});

//Post von der Fileupload IN server
app.post('/fileupload', function (req, res) {

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = 'C:/Users/jesus/Documents/HAW/Semester 2/Angewandte Programmierung/AP Projekt' + files.filetoupload.name;  //Name(Präfix) und speicher verzeichnis von Bild
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
 });
});
app.listen(3000, function(){
    console.log("Listening on Port 3000");
});