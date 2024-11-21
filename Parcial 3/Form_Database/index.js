const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a SQL Server
const dbConfig = {
  user: 'sa', // Cambia esto a tu usuario de SQL Server (por ejemplo, "sa")
  password: 'tu_contraseña', // Cambia esto a tu contraseña de SQL Server
  server: 'localhost', // Cambia esto si tu servidor no está en localhost
  database: 'Bantec', // Nombre de tu base de datos
  options: {
    encrypt: false, // Cambia a true si estás en Azure
    trustServerCertificate: true, // Necesario para conexiones locales
  },
};

// Conectar a la base de datos
sql.connect(dbConfig)
  .then(() => {
    console.log('Conexión exitosa a SQL Server');
  })
  .catch((err) => {
    console.error('Error conectando a SQL Server:', err.message);
    process.exit(1);
  });

// Endpoint para consultar datos
app.get('/consulta', async (req, res) => {
  const { cliente } = req.query;

  if (!cliente) {
    return res.status(400).json({ error: 'El parámetro "cliente" es obligatorio.' });
  }

  try {
    const query = `SELECT numcta, numsuc, fechaap FROM cuentas WHERE cliente = @cliente`;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().input('cliente', sql.Int, cliente).query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    res.json(result.recordset[0]); // Devuelve el primer resultado
  } catch (err) {
    console.error('Error en la consulta:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Iniciar el servidor
const PORT = 8088;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});






