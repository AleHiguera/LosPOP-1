const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Resuelve la ruta para asegurar que instituto.db se cree en la raíz del proyecto LosPOP
const dbPath = path.resolve(__dirname, '../instituto.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    } else {
        console.log('✅ Conexión exitosa a la base de datos (instituto.db).');
    }
});

db.serialize(() => {
    // 1. Tabla central de usuarios para login (Si decides centralizar credenciales)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identificador TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        tipo TEXT NOT NULL
    )`);

    // 2. Tabla para registros de aspirantes
    db.run(`CREATE TABLE IF NOT EXISTS registros_aspirantes (
        id_aspirante INTEGER PRIMARY KEY AUTOINCREMENT,
        curp TEXT UNIQUE NOT NULL,
        nombre_completo TEXT NOT NULL,
        carrera_interes TEXT NOT NULL,
        email TEXT NOT NULL
    )`);

    // 3. Tabla para docentes (Campos del formulario)
    db.run(`CREATE TABLE IF NOT EXISTS docentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_num TEXT UNIQUE NOT NULL,
        doc_nombre TEXT NOT NULL,
        doc_rfc TEXT NOT NULL,
        doc_depto TEXT NOT NULL,
        doc_correo TEXT NOT NULL
    )`);

    // 4. Tabla para materias (Campos del formulario)
    db.run(`CREATE TABLE IF NOT EXISTS materias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mat_clave TEXT UNIQUE NOT NULL,
        mat_nombre TEXT NOT NULL,
        mat_corto TEXT,
        mat_creditos INTEGER NOT NULL,
        mat_carrera TEXT NOT NULL,
        mat_semestre TEXT NOT NULL,
        horas_t INTEGER DEFAULT 0,
        horas_p INTEGER DEFAULT 0,
        horas_total INTEGER NOT NULL
    )`);

    // 5. Tabla para alumnos (Requerida por registro-alumno.html y el Controlador de Autenticación)
    db.run(`CREATE TABLE IF NOT EXISTS alumnos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_control TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        correo TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // 6. Tabla para grupos (Requerida por registro-grupo.html)
    db.run(`CREATE TABLE IF NOT EXISTS grupos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clave_grupo TEXT UNIQUE NOT NULL,
        mat_clave TEXT NOT NULL,
        doc_num TEXT NOT NULL,
        cupo INTEGER NOT NULL,
        FOREIGN KEY (mat_clave) REFERENCES materias(mat_clave),
        FOREIGN KEY (doc_num) REFERENCES docentes(doc_num)
    )`);
});

module.exports = db;