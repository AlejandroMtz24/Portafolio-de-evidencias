const mysql = require('mysql');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');
const { body, validationResult } = require('express-validator');

const app = express();
// Middlewares para parsear el cuerpo de la solicitud
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware para habilitar CORS
app.use(cors());

// Configuración de conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "entrenador",
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error("Error conectando a la base de datos:", err);
        return;
    }
    console.log("Conectado a la base de datos.");
});

// Ruta para consultar usuario por ID
app.get("/usuario", (req, res) => {
    const id = req.query.id;

    // Validar que el ID sea proporcionado y válido
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "El ID debe ser un número válido xdddd." });
    }

    const sql = "SELECT * FROM usuario WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error al realizar la consulta:", err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        else if (result.length === 0) {
            return res.status(404).json({ error: "No se encontró el usuario con ese ID" });
        }
        else{
            res.json(result[0]);
        }                
    });
});

// Ruta para eliminar un usuario por ID
app.delete("/usuario", (req, res) => {
    const id = req.query.id;
 
    // Validar que el ID sea proporcionado y válido
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "El ID debe ser un número válido." });
    }
 
    const sql = "DELETE FROM usuario WHERE id = ?";
 
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar el registro:", err);
            return res.status(500).json({ error: "Error al eliminar el usuario." });
        }
 
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No se encontró el usuario con ese ID." });
        }
 
        res.json({ mensaje: "Usuario eliminado correctamente." });
    });
});

//Ruta para actualizar un registro
app.put("/usuario", express.json(), (req, res) => {
    const { id, nombre, apellidoPaterno, apellidoMaterno, edad, genero, generacionFavorita, regionFavorita, tipoFavorito, mecanicaFavorita, pokemonFavorito, juegoFavorito, equipo, episodio, tiempoJugando, interaccion, temaMusica,comentarios, elMejor } = req.body;

    console.log(req.body);
    if (!id || !nombre || !apellidoPaterno || !apellidoMaterno || !edad || !genero || !generacionFavorita || !regionFavorita || !tipoFavorito || !mecanicaFavorita || !pokemonFavorito || !juegoFavorito || !equipo || !episodio || !tiempoJugando|| !interaccion || !temaMusica || !comentarios || !elMejor ) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    } 

    if (isNaN(edad) || edad <= 0) {
        return res.status(400).json({ error: "La edad debe ser un número positivo." });
    }

    const sql = "UPDATE usuario SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, edad = ?, genero = ?, generacion_favorita = ?, region_favorita = ?, tipo_favorito = ?, mecanica_favorita = ?, pokemon_favorito = ?, juego_favorito = ?, equipo_pokemon_favorito = ?, episodio_o_pelicula_favorita = ?, tiempo_jugando_pokemon = ?, interracion_favorita = ?, tema_de_musica_favorita = ?, comentarios_o_sugerencias = ?, pokemon_es_el_mejor = ? WHERE id = ?";
    const valores = [nombre, apellidoPaterno, apellidoMaterno, edad, genero, generacionFavorita, regionFavorita,
        tipoFavorito,
        mecanicaFavorita, pokemonFavorito,
        juegoFavorito,
        equipo, episodio, tiempoJugando, interaccion, temaMusica, comentarios, elMejor, id];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Error al actualizar el registro:", err);
            return res.status(500).json({ error: "Error al actualizar el registro" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No se encontró el usuario con ese ID" });
        }

        res.json({ mensaje: "Usuario actualizado correctamente" });
    });
});


// Ruta para agregar un nuevo usuario
app.post("/usuario", express.json(), (req, res) => {
    
   

    const { id, nombre, apellidoPaterno, apellidoMaterno, edad, genero, generacionFavorita, regionFavorita, tipoFavorito, mecanicaFavorita, pokemonFavorito, juegoFavorito, equipo, episodio, tiempoJugando, interaccion, temaMusica, comentarios, elMejor } = req.body;
    console.log("Datos recibidos en el backend:", req.body);  // Esto imprimirá los datos recibidos
   
    if (isNaN(edad) || edad <= 0) {
        return res.status(400).json({ error: "La edad debe ser un número positivo." });
    }

    const sql = "INSERT INTO usuario (id, nombre, apellido_paterno, apellido_materno, edad, genero, generacion_favorita, region_favorita, tipo_favorito, mecanica_favorita, pokemon_favorito, juego_favorito, equipo_pokemon_favorito, episodio_o_pelicula_favorita, tiempo_jugando_pokemon, interracion_favorita, tema_de_musica_favorita, comentarios_o_sugerencias, pokemon_es_el_mejor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
    const valores = [id, nombre, apellidoPaterno, apellidoMaterno, edad, genero, generacionFavorita, regionFavorita, tipoFavorito, mecanicaFavorita, pokemonFavorito, juegoFavorito, equipo, episodio, tiempoJugando, interaccion, temaMusica, comentarios, elMejor];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Error al agregar el usuario:", err);
            return res.status(500).json({ error: "Error al agregar el usuario." });
        }

        res.json({ mensaje: "Usuario agregado correctamente" });
    });
});




// Configuración de Multer para manejo de archivos
const storage = multer.memoryStorage(); // Guardar archivos en memoria
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes PNG o JPG.'));
        }
    },
});

// Validaciones con express-validator
const validarFormulario = [
    body('id')
        .isInt({ min: 1, max: 1000 })
        .withMessage('La id debe ser un número.')
        .toInt(),
    body('nombre')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres.')
        .trim()
        .escape(),
    body('apellido-paterno')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido paterno debe tener entre 2 y 50 caracteres.')
        .trim()
        .escape(),
    body('apellido-materno')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido materno debe tener entre 2 y 50 caracteres.')
        .trim()
        .escape(),
    body('edad')
        .isInt({ min: 1, max: 120 })
        .withMessage('La edad debe ser un número entre 1 y 120.')
        .toInt(),
    body('genero')
        .isIn(['masculino', 'femenino', 'no-binario', 'prefiero-no-decirlo'])
        .withMessage('El género seleccionado no es válido.'),
    body('generacion-favorita').notEmpty().withMessage('Debes seleccionar una generación favorita.'),
    body('region-favorita').notEmpty().withMessage('Debes seleccionar una región favorita.'),
    body('tipo-favorito').notEmpty().withMessage('Debes seleccionar un tipo favorito.'),
    body('mecanica-favorita').notEmpty().withMessage('Debes seleccionar una mecánica favorita.'),
    body('pokemon-favorito')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre del Pokémon favorito debe tener entre 2 y 50 caracteres.')
        .trim()
        .escape(),
];

// Ruta para manejar el formulario
app.post('/submit', upload.fields([
    { name: 'imagen-foto', maxCount: 1 },
    { name: 'imagen-pokemon', maxCount: 1 },
    { name: 'imagen-juego', maxCount: 1 },
]), validarFormulario, (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const {
        id,
        nombre,
        "apellido-paterno": apellidoPaterno,
        "apellido-materno": apellidoMaterno,
        edad,
        genero,
        "generacion-favorita": generacionFavorita,
        "region-favorita": regionFavorita,
        "tipo-favorito": tipoFavorito,
        "mecanica-favorita": mecanicaFavorita,
        "pokemon-favorito": pokemonFavorito,
        "juego-favorito": juegoFavorito,
        "equipo": equipo,
        "episodio": episodio,
        "tiempo-jugando": tiempoJugando,
        "tema-musica": temaMusica,
        comentarios,
        noticias,
    } = req.body;

    const archivos = req.files;

    try {
        const doc = new PDFDocument();
        let buffers = [];

        // Escuchar datos generados por el PDF
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=pokemon-formulario.pdf');
            res.send(pdfBuffer); // Enviar el PDF al navegador
            
        });

        // Añadir marco a todas las páginas
        const addBorder = () => {
            doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20)  // Definir el rectángulo (margen de 10 en cada lado)
                .lineWidth(2)  // Grosor del borde
                .strokeColor('#4B9CD3')  // Color del borde (puedes cambiar el color aquí)
                .stroke();  // Dibujar el borde
        };

        // Agregar marco a la primera página
        addBorder();

        // Contenido del PDF
        // Estilo del documento
        doc.fillColor('black').fontSize(12).font('Helvetica');

        doc.fontSize(10).fillColor('#888').text('Formulario Creado por Duilio Oswaldo Ramirez Castillo y Alejandro Martinez Bernal', { align: 'center' });
        doc.text('© 2024 Todos los derechos reservados a Game Freak, Pokemon Company y Nintendo', { align: 'center' });
        doc.moveDown();
        // Título
        doc.fontSize(20).fillColor('#4B9CD3').text('Formulario de Pokémon', { align: 'center' });
        doc.moveDown(2);

        // Información personal
        doc.fontSize(20).fillColor('#4B9CD3').text("Informacion personal");
        doc.moveDown();
        doc.fontSize(14).fillColor('#333').text(`ID: ${id}`);
        doc.moveDown();
        doc.text(`Nombre: ${nombre} ${apellidoPaterno} ${apellidoMaterno}`);
        doc.moveDown();
        doc.text(`Edad: ${edad}`);
        doc.moveDown();
        doc.text(`Género: ${genero}`);
        doc.moveDown(7);




        // Preferencias Pokémon
        doc.fontSize(20).fillColor('#4B9CD3').text("Preferencias Pokemon");
        doc.moveDown();
        doc.fontSize(14).fillColor('#333').text(`Generación Favorita: ${generacionFavorita}`);
        doc.moveDown();
        doc.text(`Región Favorita: ${regionFavorita}`);
        doc.moveDown();
        doc.text(`Tipo Favorito: ${tipoFavorito}`);
        doc.moveDown();
        doc.text(`Mecánica Favorita: ${mecanicaFavorita}`);
        doc.moveDown();
        doc.text(`Pokémon Favorito: ${pokemonFavorito}`);
        doc.moveDown();
        doc.text(`Juego Favorito: ${juegoFavorito}`);
        doc.moveDown(7);




        

        // Información adicional
        doc.fontSize(20).fillColor('#4B9CD3').text("Informacion adicional")
        doc.moveDown();
        doc.fontSize(14).fillColor('#333').text(`Equipo Pokémon: ${equipo || 'No especificado'}`);
        doc.moveDown();
        doc.text(`Episodio o Película Favorita: ${episodio || 'No especificado'}`);
        doc.moveDown();
        doc.text(`Tiempo Jugando Pokémon: ${tiempoJugando || 'No especificado'}`);
        doc.moveDown();
        doc.text(`Tema de Música Favorito: ${temaMusica || 'No especificado'}`);
        doc.moveDown();
        doc.text(`Comentarios o Sugerencias: ${comentarios || 'Ninguno'}`);
        doc.moveDown();
        doc.text(`¿Es Pokémon el mejor juego de Nintendo?: ${noticias || 'No especificado'}`);
        doc.moveDown(2);

        // Agregar marco a la segunda página
        addBorder();

        // Agregar imágenes al PDF
        ['imagen-foto', 'imagen-pokemon', 'imagen-juego'].forEach((key) => {
            if (archivos[key] && archivos[key].length > 0) {
                const archivo = archivos[key][0];
                const imgBuffer = archivo.buffer;
                doc.moveDown(3);
                doc.text(`Imagen asociada (${key}):`);
                doc.image(imgBuffer, {
                    fit: [100, 100],
                    align: 'center',
                });
                doc.moveDown(5);
            }
        });
        
        // Agregar marco a la tercera página
        addBorder();

        doc.end(); // Finalizar la generación del PDF
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF.');
    }
});

// Iniciar el servidor
const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});