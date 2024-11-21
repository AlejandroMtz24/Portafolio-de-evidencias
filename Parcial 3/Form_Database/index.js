const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const PDFDoc = require('pdfkit');
const fs = require('fs');
const mysql = require('mysql2');
const { check, validationResult } = require('express-validator');
 
const app = express();
 
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'web'
});
 
// Middleware para habilitar CORS
app.use(cors());
 
const folder = path.join(__dirname+'/archivos/');
 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, folder)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
 
//const upload = multer( { dest:folder } );
const upload = multer( {storage: storage} );
 
app.use(upload.single('archivo'));
 
// Middlewares que parsean el cuerpo de la solicitud a JSON o texto, cuando se recibe json
app.use(express.json());
app.use(express.text());
 
app.use(express.urlencoded( { extended : true } ));
 
const validacion = [
    check('nombre').trim(),
    check('apellido').trim(),
    check('email').normalizeEmail(),
    check('ncontrol').trim(),
    check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    check('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    check('email').isEmail().withMessage('El email es inválido'),
    check('ncontrol').notEmpty().withMessage('El número de control es obligatorio')
   
];
 
const validacionConsulta = [
    check('id').trim().notEmpty().withMessage('Escriba un id'),
    check('id').isNumeric().withMessage('Escriba un id valido')
];
 
app.get('/usuario', validacionConsulta, async (req, res)=> {
 
    try{
        const validResult = validationResult(req);
        if(!validResult.isEmpty()){
            return res.status(400).send(validResult);
        }
        const { id } = req.query;
        connection.query(
            `SELECT * FROM alumno WHERE id =  ${id}`,
            function (err, results, fields) {
              console.log(results); // results contains rows returned by server
              if(results.length > 0){
                res.json(results[0]);
              }else{
                res.status(400).json(errors = {errors: [{
                    msg: 'No existe el usuario'
                }]});
              }
             
            }
          );
    }catch(error){
        console.error(error);
    }
})


app.post('/formulario', upload.single('archivo'), validacion, (req, res) => {
    try {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Debe subir un archivo PNG o JPG.' });
        }

        const { nombre, apellido, email, ncontrol } = req.body;
        const imagenPath = req.file.path;

        // Definir y validar la carpeta para guardar los PDFs
        const archivosGenPath = path.join(__dirname, 'archivosgen');
        if (!fs.existsSync(archivosGenPath)) {
            fs.mkdirSync(archivosGenPath);
        }

        console.log('Ruta de la carpeta archivosgen:', archivosGenPath);

        const doc = new PDFDoc();
        const pdfPath = path.join(archivosGenPath, `datos_usuario_${Date.now()}.pdf`);

        console.log('Ruta para guardar el PDF:', pdfPath);

        // Generar el contenido del PDF
        doc.fontSize(20).text('Información del Usuario', { align: 'center' });

        doc.moveDown();
        doc.fontSize(14);
        doc.text(`Nombre: ${nombre}`);
        doc.text(`Apellido: ${apellido}`);
        doc.text(`Email: ${email}`);
        doc.text(`Numero de control: ${ncontrol}`);

        console.log('Datos del usuario agregados al PDF.');

        if (fs.existsSync(imagenPath)) {
            doc.moveDown();
            doc.text('Imagen subida:', { underline: true });
            doc.image(imagenPath, {
                fit: [300, 300],
                align: 'center',
            });
            console.log('Imagen añadida al PDF.');
        } else {
            doc.moveDown();
            doc.text('No se pudo cargar la imagen.');
            console.log('No se encontró la imagen.');
        }

        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);
        doc.end();

        writeStream.on('finish', () => {
            console.log(`PDF guardado en: ${pdfPath}`);
            res.sendFile(pdfPath);
        });

        writeStream.on('error', (err) => {
            console.error('Error al guardar el archivo PDF:', err);
            res.status(500).send('Error al generar el PDF.');
        });
    } catch (error) {
        console.error('Error inesperado:', error);
        res.status(500).send('Ocurrió un error al procesar la solicitud.');
    }
});

 
app.listen(8088, () => {
    console.log('Servidor Express escuchando en el puerto 8088');
});



