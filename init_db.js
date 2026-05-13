// init_db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./instituto.db');

db.serialize(() => {

    // 1. Tabla de Personal
    db.run(`CREATE TABLE IF NOT EXISTS personal (
        id_personal       INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_empleado   TEXT UNIQUE NOT NULL,
        password_hash     TEXT NOT NULL,
        nombre            TEXT NOT NULL,
        rol               TEXT DEFAULT 'staff'
    )`);

    // 2. Tabla de Usuarios (login centralizado)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        identificador TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        tipo          TEXT NOT NULL
    )`);

    // 3. Tabla de Aspirantes
    db.run(`CREATE TABLE IF NOT EXISTS registros_aspirantes (
        id_aspirante    INTEGER PRIMARY KEY AUTOINCREMENT,
        curp            TEXT UNIQUE NOT NULL,
        nombre_completo TEXT NOT NULL,
        carrera_interes TEXT NOT NULL,
        email           TEXT NOT NULL
    )`);

    // 4. Tabla de Docentes
    db.run(`CREATE TABLE IF NOT EXISTS docentes (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_num     TEXT UNIQUE NOT NULL,
        doc_nombre  TEXT NOT NULL,
        doc_rfc     TEXT,
        doc_depto   TEXT,
        doc_correo  TEXT
    )`);

    // 5. Tabla de Materias
    db.run(`CREATE TABLE IF NOT EXISTS materias (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        mat_clave    TEXT UNIQUE NOT NULL,
        mat_nombre   TEXT NOT NULL,
        mat_corto    TEXT,
        mat_creditos INTEGER NOT NULL,
        mat_carrera  TEXT NOT NULL,
        mat_semestre TEXT NOT NULL,
        horas_t      INTEGER DEFAULT 0,
        horas_p      INTEGER DEFAULT 0,
        horas_total  INTEGER NOT NULL
    )`);

    // 6. Tabla de Alumnos (campos completos según formulario)
    db.run(`CREATE TABLE IF NOT EXISTS alumnos (
        id_alumno           INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_control      TEXT UNIQUE NOT NULL,
        curp                TEXT UNIQUE,
        nombre              TEXT NOT NULL,
        apellido_paterno    TEXT NOT NULL,
        apellido_materno    TEXT,
        fecha_nacimiento    DATE,
        sexo                TEXT,
        estado_civil        TEXT,
        telefono_casa       TEXT,
        telefono_celular    TEXT,
        correo              TEXT UNIQUE,
        direccion           TEXT,
        ciudad              TEXT,
        codigo_postal       TEXT,
        escuela_procedencia TEXT,
        promedio_bachiller  REAL,
        anio_egreso         INTEGER,
        carrera             TEXT NOT NULL,
        semestre            INTEGER DEFAULT 1,
        periodo_inscripcion TEXT,
        fecha_inscripcion   DATE,
        tipo_ingreso        TEXT DEFAULT 'N',
        beca                TEXT DEFAULT 'N',
        tutor_nombre        TEXT,
        tutor_telefono      TEXT,
        tutor_parentesco    TEXT,
        tutor_correo        TEXT,
        estado              TEXT DEFAULT 'A',
        credencial_vigente  TEXT DEFAULT 'S',
        password_hash       TEXT NOT NULL
    )`);

    // 7. Tabla de Grupos (campos completos según formulario)
    db.run(`CREATE TABLE IF NOT EXISTS grupos (
        id_grupo      INTEGER PRIMARY KEY AUTOINCREMENT,
        clave_grupo   TEXT UNIQUE NOT NULL,
        nombre_grupo  TEXT NOT NULL,
        carrera       TEXT NOT NULL,
        semestre      INTEGER NOT NULL,
        periodo       TEXT,
        cupo_maximo   INTEGER,
        fecha_inicio  DATE,
        fecha_fin     DATE,
        id_materia    INTEGER,
        id_docente    INTEGER,
        horario_dias  TEXT,
        hora_inicio   TEXT,
        hora_fin      TEXT,
        aula          TEXT,
        estado        TEXT DEFAULT 'Activo',
        modalidad     TEXT DEFAULT 'Presencial',
        observaciones TEXT,
        FOREIGN KEY (id_materia) REFERENCES materias(id),
        FOREIGN KEY (id_docente) REFERENCES docentes(id)
    )`, () => {
        console.log("✅ Todas las tablas verificadas/creadas correctamente.");
        db.close((err) => {
            if (err) console.error("Error al cerrar la DB:", err.message);
            else console.log("🔌 Conexión cerrada.");
        });
    });

});

module.exports = db;