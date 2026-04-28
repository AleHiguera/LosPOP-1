// test_db.js
const db = require('./config/db'); // Ajusta la ruta a donde tengas tu db.js

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='personal';", [], (err, rows) => {
    if (err) {
        console.error(" Error al conectar a la base de datos:", err.message);
    } else if (rows.length > 0) {
        console.log("¡Éxito! La base de datos está conectada y la tabla 'personal' existe.");
    } else {
        console.log("La conexión funciona, pero la tabla 'personal' no se encontró. Verifica tu script de creación.");
    }
    // Cierra la conexión después de la prueba
    db.close();
});