const express = require('express');
const app = express();
app.use(express.json());

app.get('/administrativos', (req, res) => {
    console.log(req.query)
    res.send('Servidor contestando a peticion GET')
});


app.get('/maestros', (req, res) => {
    console.log(req.body)
    res.send('Servidor contestando a peticion GET')
});

app.get('/estudiantes/:carrera', (req, res) => {
    console.log(req.params.carrera)
    console.log(req.query.control)
    res.send('Servidor contestando a peticion')
});

app.listen(8000,() => {
    console.log('Servidor escuchando en el puerto 8000')
});