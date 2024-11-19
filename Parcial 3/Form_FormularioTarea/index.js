const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

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

// Validar tipos de archivo permitidos (solo PNG y JPG)
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

// Validaciones con express-validator
const validarFormulario = [
    // 1. Longitud mínima y máxima para texto
    body('nombre')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres.'),
    body('apellido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido debe tener entre 2 y 50 caracteres.'),

    // 3. Sanitización de entradas
    body('nombre').trim().escape(),
    body('apellido').trim().escape(),
    body('email').trim().normalizeEmail(),

    // 4. Validar que todos los campos obligatorios estén presentes
    body('nombre').notEmpty().withMessage('El nombre es obligatorio.'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio.'),
    body('email').notEmpty().withMessage('El correo electrónico es obligatorio.'),

    // 6. Validar nombres y apellidos solo con letras
    body('nombre')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios.'),
    body('apellido')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El apellido solo puede contener letras y espacios.'),

    // 9. Validar caracteres peligrosos y quitar entradas con caracteres bajos
    body('nombre').stripLow(),
    body('apellido').stripLow(),

    // 10. Validar que no sean solo espacios
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío ni contener solo espacios.'),
    body('apellido')
        .trim()
        .notEmpty()
        .withMessage('El apellido no puede estar vacío ni contener solo espacios.')
];

// Ruta para manejar el formulario
app.post(
    '/formulario',
    upload.single('archivo'), // Manejo del archivo
    validarFormulario, // Middleware de validaciones
    (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            // Si hay errores, devolver un estado 400 con los mensajes
            return res.status(400).json({ errores: errores.array() });
        }

        // Verificar si hubo un error con el archivo
        if (!req.file) {
            return res.status(400).json({ error: 'Debe subir un archivo PNG o JPG.' });
        }

        const { nombre, apellido, telefono, email } = req.body;
        const imagenPath = req.file.path;

        const doc = new PDFDocument();
        const pdfPath = path.join(archivosGenPath, `datos_usuario_${Date.now()}.pdf`);

        // Generar el contenido del PDF
        doc.fontSize(20).text('Información del Usuario', { align: 'center' });

        doc.moveDown();
        doc.fontSize(14);
        doc.text(`Nombre: ${nombre}`);
        doc.text(`Apellido: ${apellido}`);
        doc.text(`Teléfono: ${telefono || 'No proporcionado'}`);
        doc.text(`Email: ${email}`);

        // Añadir la imagen si existe
        if (fs.existsSync(imagenPath)) {
            doc.moveDown();
            doc.text('Imagen subida:', { underline: true });
            doc.image(imagenPath, {
                fit: [300, 300], // Ajustar el tamaño según sea necesario
                align: 'center',
            });
        } else {
            doc.moveDown();
            doc.text('No se pudo cargar la imagen.');
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
            console.error('Error al guardar el archivo PdDF:', err);
            res.status(500).send('Error al generar el PDF.');
        });
    }
);

app.listen(8088, () => {
    console.log('Servidor Express escuchando en el puerto 8088');
});



