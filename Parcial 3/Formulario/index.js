const express = require('express');
const path = require('path');
const app = express();

//console.log(__dirname);
//console.log(__filename);

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extende:true}));


app.post('/formulario', (req, res) => {
    console.log(req.body);
    res.send(`Hola ${req.body.Nombre}`);
});


app.listen(8084,() => {
    console.log('Servidor escuchando en el puerto 8084');
});