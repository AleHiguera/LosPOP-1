const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./instituto.db');

db.serialize(() => {
    // Tabla central de usuarios para login
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identificador TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        tipo TEXT NOT NULL
    )`);

    // Tabla para registros de aspirantes
    db.run(`CREATE TABLE IF NOT EXISTS registros_aspirantes (
        id_aspirante INTEGER PRIMARY KEY AUTOINCREMENT,
        curp TEXT UNIQUE NOT NULL,
        nombre_completo TEXT NOT NULL,
        carrera_interes TEXT NOT NULL,
        email TEXT NOT NULL
    )`);

    // Tabla para docentes (Campos del formulario: doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo)
    db.run(`CREATE TABLE IF NOT EXISTS docentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_num TEXT UNIQUE NOT NULL,
        doc_nombre TEXT NOT NULL,
        doc_rfc TEXT NOT NULL,
        doc_depto TEXT NOT NULL,
        doc_correo TEXT NOT NULL
    )`);

    // Tabla para materias (Campos del formulario: mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total)
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
});

module.exports = db;