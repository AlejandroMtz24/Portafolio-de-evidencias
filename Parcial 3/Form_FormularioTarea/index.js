const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit'); // Importar pdfkit
const fs = require('fs'); // Para manejar archivos

const app = express();

// Middleware para habilitar CORS
app.use(cors());

// Middlewares para parsear el cuerpo de la solicitud
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Multer para manejo de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/archivos/'));
    },
    filename: function (req, file, cb) {
        cb(null, 'imagen-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Crear la carpeta "archivosgen" si no existe
const archivosGenPath = path.join(__dirname, '/archivosgen/');
if (!fs.existsSync(archivosGenPath)) {
    fs.mkdirSync(archivosGenPath);
}

// Ruta para manejar el formulario
app.post('/formulario', upload.single('archivo'), (req, res) => {
    const { nombre, apellido, telefono, email } = req.body;
    const imagenPath = req.file ? req.file.path : null;

    const doc = new PDFDocument();
    const pdfPath = path.join(archivosGenPath, `datos_usuario_${Date.now()}.pdf`);

    // Generar el contenido del PDF
    doc.fontSize(20).text('Información del Usuario', { align: 'center' });

    doc.moveDown();
    doc.fontSize(14);
    doc.text(`Nombre: ${nombre}`);
    doc.text(`Apellido: ${apellido}`);
    doc.text(`Teléfono: ${telefono}`);
    doc.text(`Email: ${email}`);

    // Añadir la imagen si existe
    if (imagenPath) {
        if (fs.existsSync(imagenPath)) {
            doc.moveDown();
            doc.text('Imagen subida:', { underline: true });
            doc.image(imagenPath, {
                fit: [300, 300], // Ajustar el tamaño según sea necesario
                align: 'center'
            });
        } else {
            doc.moveDown();
            doc.text('No se pudo cargar la imagen.');
        }
    } else {
        doc.moveDown();
        doc.text('No se subió ninguna imagen.');
    }

    // Guardar el PDF en la carpeta archivosgen
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);
    doc.end();

    writeStream.on('finish', () => {
        // Enviar el archivo generado como respuesta
        res.sendFile(pdfPath);
    });

    writeStream.on('error', (err) => {
        console.error('Error al guardar el archivo PDF:', err);
        res.status(500).send('Error al generar el PDF.');
    });

    // Opcional: Eliminar el archivo de imagen después de procesar
    if (imagenPath) {
        fs.unlink(imagenPath, (err) => {
            if (err) console.error('Error al eliminar la imagen:', err);
        });
    }
});

app.listen(8088, () => {
    console.log('Servidor Express escuchando en el puerto 8088');
});


