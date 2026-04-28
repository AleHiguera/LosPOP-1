// init_db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./instituto.db');

db.serialize(() => {
    // 1. Tabla de Personal
    db.run(`CREATE TABLE IF NOT EXISTS personal (
        id_personal INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_empleado TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nombre TEXT NOT NULL,
        rol TEXT DEFAULT 'staff'
    )`);

    // 2. Tabla de Usuarios (para Login centralizado)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identificador TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        tipo TEXT NOT NULL
    )`);

    // 3. Tabla de Aspirantes
    db.run(`CREATE TABLE IF NOT EXISTS registros_aspirantes (
        id_aspirante INTEGER PRIMARY KEY AUTOINCREMENT,
        curp TEXT UNIQUE NOT NULL,
        nombre_completo TEXT NOT NULL,
        carrera_interes TEXT NOT NULL,
        email TEXT NOT NULL
    )`, () => {
        console.log(" Tablas creadas correctamente.");
        db.close();
    });
});