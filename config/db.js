const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crea archivo de base de datos 
const dbPath = path.resolve(__dirname, '../instituto.db');
const db = new sqlite3.Database(dbPath);

// Crear la tabla para el personal
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS personal (
        id_personal INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_empleado TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nombre TEXT NOT NULL,
        rol TEXT DEFAULT 'staff',
        activo INTEGER DEFAULT 1
    )`);
});

module.exports = db;