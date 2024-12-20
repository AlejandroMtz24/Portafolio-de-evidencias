const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');
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
 
// Configurar Multer para manejo de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/archivos/'));
    },
    filename: function (req, file, cb) {
        cb(null, 'imagen-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Archivo permitido
    } else {
        cb(new Error('El archivo debe ser una imagen PNG o JPG.'));
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Crear la carpeta "archivosgen" si no existe
const archivosGenPath = path.join(__dirname, '/archivosgen/');
if (!fs.existsSync(archivosGenPath)) {
    fs.mkdirSync(archivosGenPath);
}
 
 
// Middlewares que parsean el cuerpo de la solicitud a JSON o texto, cuando se recibe json
app.use(express.json());
app.use(express.text());
 
app.use(express.urlencoded( { extended : true } ));
 
const validacion = [
    check('nombre').trim(),
    check('apellido').trim(),
    check('email').normalizeEmail(),
    check('ncontrol').trim(),
    check('nombre').notEmpty().withMessage('Porfavor, agregue un nombre en el campo correspondiente'),
    check('apellido').notEmpty().withMessage('Porfavor, agregue un apellido en el campo correspondiente'),
    check('email').isEmail().withMessage('El email no es valido, debe tener el formato: @gmail.com'),
    check('ncontrol').notEmpty().withMessage('Porfavor, agregue un numero de control en el campo correspondiente')
   
];
 
const validacionConsulta = [
    check('id').trim().notEmpty().withMessage('El id es obligatorio'),
    check('id').isNumeric().withMessage(', porfavor escriba un id valido')
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
 
app.post('/generarPdf', upload.single('archivo'), validacion, async (req, res) => {
    try{
        const validResult = validationResult(req);
        if(!validResult.isEmpty()){
            return res.status(400).send(validResult);
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Debe subir un archivo PNG o JPG.' });
        }
    
        const { nombre, apellido, ncontrol, email } = req.body;
        const imagenPath = req.file.path;
    
        const doc = new PDFDocument();
        const pdfPath = path.join(archivosGenPath, `datos_usuario_${Date.now()}.pdf`);
    
        // Generar el contenido del PDF
        doc.fontSize(20).text('Información del Usuario', { align: 'center' });
    
        doc.moveDown();
        doc.fontSize(14);
        doc.text(`Nombre: ${nombre}`);
        doc.text(`Apellido: ${apellido}`);
        doc.text(`Numero de control: ${ncontrol || 'No proporcionado'}`);
        doc.text(`Email: ${email}`);
    
        if (fs.existsSync(imagenPath)) {
            doc.moveDown();
            doc.text('Imagen subida:', { underline: true });
            doc.image(imagenPath, {
                fit: [300, 300],
                align: 'center',
            });
        } else {
            doc.moveDown();
            doc.text('No se pudo cargar la imagen.');
        }
    
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);
        doc.end();
    console.log(pdfPath);
    
        writeStream.on('finish', () => {
            
            res.status(200).sendFile(pdfPath);
        });
    
        writeStream.on('error', (err) => {
            console.error('Error al guardar el archivo PDF:', err);
            res.status(500).send('Error al generar el PDF.');
        });
    } catch(error){
        console.log(error);
        
    }
})

app.post('/usuario', upload.single('archivo'), validacion, async (req, res) => {
    try {
        const validResult = validationResult(req);
        if (!validResult.isEmpty()) {
            return res.status(400).send(validResult);
        }

        const { nombre, apellido, email, ncontrol } = req.body;
        connection.query(
            `INSERT INTO alumno (nombre, apellido, email, ncontrol) VALUES (?, ?, ?, ?)`,
            [nombre, apellido, email, ncontrol],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ msg: "Error al insertar usuario" });
                }
                res.status(200).json({ msg: "Usuario registrado exitosamente" });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
});


app.delete('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        connection.query(
            `DELETE FROM alumno WHERE id = ?`,
            [id],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ msg: "Error al eliminar usuario" });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ msg: "Usuario no encontrado" });
                }
                res.status(200).json({ msg: "Usuario eliminado exitosamente" });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
});

app.put('/usuario/:id', upload.single('archivo'), validacion, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, ncontrol } = req.body;

        connection.query(
            `UPDATE alumno SET nombre = ?, apellido = ?, email = ?, ncontrol = ? WHERE id = ?`,
            [nombre, apellido, email, ncontrol, id],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ msg: "Error al actualizar usuario" });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ msg: "Usuario no encontrado" });
                }
                res.status(200).json({ msg: "Usuario actualizado exitosamente" });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
});

 
app.listen(8088, () => {
    console.log('Servidor Express escuchando en el puerto 8088');
});