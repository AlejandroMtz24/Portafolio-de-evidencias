const express = require('express');
const path = require('path');
const app = express();

//console.log(__dirname);
//console.log(__filename);

app.use(express.json());
app.use(express.text());

app.set('view engine','pug');
app.set('views', path.join(__dirname,'views'))

app.get('/administrativos', (req, res) => {
    console.log(req.query);
    //res.send('Servidor contestando a peticion GET');
    res.render('admin');
});


app.get('/maestros', (req, res) => {
    console.log(req.body);
    res.send('Servidor contestando a peticion GET');
});

app.get('/estudiantes/:carrera', (req, res) => {
    console.log(req.params.carrera);
    console.log(req.query.control);
    res.send('Servidor contestando a peticion GET');
});

app.listen(8084,() => {
    console.log('Servidor escuchando en el puerto 8084');
});