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

    // 2. Tabla de Usuarios
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

    // 6. Tabla de Alumnos
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

    // 7. Tabla de Grupos
    db.run(`CREATE TABLE IF NOT EXISTS grupos (
        id_grupo      INTEGER PRIMARY KEY AUTOINCREMENT,
        clave_grupo   TEXT UNIQUE NOT NULL,
        nombre_grupo  TEXT NOT NULL,
        carrera       TEXT NOT NULL,
        semestre      INTEGER NOT NULL,
        periodo       TEXT,
        cupo_maximo   INTEGER,
        estado        TEXT DEFAULT 'Activo'
    )`);

    // 8. Tabla de Relación Docente - Grupo - Materia (Asignación)
    db.run(`CREATE TABLE IF NOT EXISTS docente_grupo (
        id_asignacion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_docente    INTEGER NOT NULL,
        id_grupo      INTEGER NOT NULL,
        id_materia    INTEGER NOT NULL,
        FOREIGN KEY (id_docente) REFERENCES docentes(id) ON DELETE CASCADE,
        FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE,
        FOREIGN KEY (id_materia) REFERENCES materias(id) ON DELETE CASCADE
    )`);

    // 9. Tabla de Horarios detallados
    db.run(`CREATE TABLE IF NOT EXISTS horarios (
        id_horario    INTEGER PRIMARY KEY AUTOINCREMENT,
        id_asignacion INTEGER NOT NULL,
        dia_semana    TEXT NOT NULL, -- Lunes, Martes, etc.
        hora_inicio   TEXT NOT NULL, -- Formato HH:MM
        hora_fin      TEXT NOT NULL, -- Formato HH:MM
        aula          TEXT NOT NULL,
        FOREIGN KEY (id_asignacion) REFERENCES docente_grupo(id_asignacion) ON DELETE CASCADE
    )`, () => {
        console.log("✅ Estructura de base de datos completa y lista.");
    });
    // 10. Tabla de Calificaciones
    db.run(`CREATE TABLE IF NOT EXISTS calificaciones (
        id_calificacion     INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_control      TEXT NOT NULL,
        id_materia          INTEGER NOT NULL,
        id_grupo            INTEGER,
        calificacion_u1     REAL DEFAULT 0,
        calificacion_u2     REAL DEFAULT 0,
        calificacion_u3     REAL DEFAULT 0,
        calificacion_final  REAL DEFAULT 0,
        estado_aprobacion   TEXT DEFAULT 'Pendiente', -- Aprobado, Reprobado, Pendiente
        FOREIGN KEY (numero_control) REFERENCES alumnos(numero_control) ON DELETE CASCADE,
        FOREIGN KEY (id_materia) REFERENCES materias(id) ON DELETE CASCADE,
        FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE,
        UNIQUE(numero_control, id_materia, id_grupo)
    )`);
});

module.exports = db;