
const express = require('express');
const app = express();
const port = 9000;

app.get('/', (req, res) => {
    res.send('Hola Mundo GET');
});

app.post('/', (req, res) => {
    res.send('Hola Mundo POST');
});

app.all('*',(req,res) => {
    res.send('Ruta no encontrada');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});