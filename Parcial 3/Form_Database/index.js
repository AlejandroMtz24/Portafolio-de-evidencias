const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2/promise'); // Para la conexión a la base de datos

const app = express();

// Conexión a la base de datos
const db = mysql.createPool({
  host: 'localhost',
  user: 'tu_usuario', // Cambia esto
  password: 'tu_contraseña', // Cambia esto
  database: 'bantec', // Nombre de tu base de datos
});

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
  },
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

// Endpoint para realizar la consulta en la base de datos
app.get('/consulta', async (req, res) => {
  const { nombre, apellido } = req.query;

  try {
    const [results] = await db.query(
      'SELECT * FROM clientes WHERE nombre = ? AND apellido = ?',
      [nombre, apellido]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron registros.' });
    }

    res.json(results[0]); // Retornar el primer resultado
  } catch (error) {
    console.error('Error en la consulta:', error.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Endpoint para manejar el formulario y generar el PDF
app.post('/formulario', upload.single('archivo'), async (req, res) => {
  const { nombre, apellido, telefono, email } = req.body;

  const doc = new PDFDocument();
  const pdfPath = path.join(archivosGenPath, `datos_usuario_${Date.now()}.pdf`);

  try {
    // Generar el contenido del PDF
    doc.fontSize(20).text('Información del Usuario', { align: 'center' });

    doc.moveDown();
    doc.fontSize(14);
    doc.text(`Nombre: ${nombre}`);
    doc.text(`Apellido: ${apellido}`);
    doc.text(`Teléfono: ${telefono || 'No proporcionado'}`);
    doc.text(`Email: ${email}`);

    if (req.file) {
      doc.moveDown();
      doc.text('Imagen subida:', { underline: true });
      doc.image(req.file.path, {
        fit: [300, 300],
        align: 'center',
      });
    }

    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);
    doc.end();

    writeStream.on('finish', () => {
      res.sendFile(pdfPath);
    });

    writeStream.on('error', (err) => {
      console.error('Error al guardar el archivo PDF:', err);
      res.status(500).send('Error al generar el PDF.');
    });
  } catch (error) {
    console.error('Error en la generación del PDF:', error.message);
    res.status(500).send('Error en el servidor.');
  }
});

// Iniciar el servidor
app.listen(8088, () => {
  console.log('Servidor Express escuchando en el puerto 8088');
});



