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
    )`);

    // 4. Tabla de Alumnos (NUEVA)
    db.run(`CREATE TABLE IF NOT EXISTS alumnos (
        id_alumno INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_control TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        curp TEXT UNIQUE,
        fecha_nacimiento DATE,
        carrera TEXT NOT NULL,
        semestre INTEGER,
        correo TEXT UNIQUE,
        telefono TEXT,
        password_hash TEXT NOT NULL
    )`);

    // 5. Tabla de Grupos (NUEVA)
    db.run(`CREATE TABLE IF NOT EXISTS grupos (
        id_grupo INTEGER PRIMARY KEY AUTOINCREMENT,
        clave_grupo TEXT UNIQUE NOT NULL,
        materia TEXT NOT NULL,
        id_docente INTEGER,
        semestre INTEGER,
        aula TEXT,
        horario_dias TEXT,
        horario_horas TEXT,
        cupo_maximo INTEGER
    )`, () => {
        // Se ejecuta cuando la última tabla se termina de crear
        console.log("✅ Todas las tablas se han verificado/creado correctamente.");
        db.close((err) => {
            if (err) {
                console.error("Error al cerrar la base de datos:", err.message);
            } else {
                console.log("🔌 Conexión a la base de datos cerrada tras la inicialización.");
            }
        });
    });
});