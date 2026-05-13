// migrar_db.js
// Ejecutar UNA SOLA VEZ: node migrar_db.js
// Actualiza las tablas alumnos y grupos a la estructura nueva

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./instituto.db');

db.serialize(() => {

    // ── 1. Renombrar tabla vieja de alumnos ────────────────────────────────
    db.run(`ALTER TABLE alumnos RENAME TO alumnos_old`, (err) => {
        if (err) console.log('ℹ️  alumnos_old ya existe, omitiendo rename:', err.message);
    });

    // ── 2. Crear tabla alumnos nueva con todos los campos ──────────────────
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
    )`, (err) => {
        if (err) { console.error('❌ Error creando tabla alumnos:', err.message); return; }
        console.log('✅ Tabla alumnos nueva creada.');
    });

    // ── 3. Migrar datos existentes de alumnos_old → alumnos nueva ─────────
    db.run(`
        INSERT OR IGNORE INTO alumnos (
            id_alumno, numero_control, curp, nombre,
            apellido_paterno, apellido_materno,
            fecha_nacimiento, carrera, semestre,
            correo, telefono_celular, password_hash
        )
        SELECT
            id_alumno,
            numero_control,
            curp,
            nombre,
            COALESCE(apellidos, 'Sin apellido'),  -- apellidos viejo → apellido_paterno
            NULL,                                  -- apellido_materno vacío
            fecha_nacimiento,
            carrera,
            semestre,
            correo,
            telefono,
            password_hash
        FROM alumnos_old
    `, (err) => {
        if (err) console.log('ℹ️  Sin datos que migrar en alumnos:', err.message);
        else console.log('✅ Datos de alumnos migrados.');
    });

    // ── 4. Renombrar tabla vieja de grupos ─────────────────────────────────
    db.run(`ALTER TABLE grupos RENAME TO grupos_old`, (err) => {
        if (err) console.log('ℹ️  grupos_old ya existe, omitiendo rename:', err.message);
    });

    // ── 5. Crear tabla grupos nueva con todos los campos ───────────────────
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
    )`, (err) => {
        if (err) { console.error('❌ Error creando tabla grupos:', err.message); return; }
        console.log('✅ Tabla grupos nueva creada.');
    });

    // ── 6. Migrar datos existentes de grupos_old → grupos nueva ───────────
    db.run(`
        INSERT OR IGNORE INTO grupos (
            id_grupo, clave_grupo, nombre_grupo, carrera,
            semestre, cupo_maximo, id_docente,
            horario_dias, hora_inicio, hora_fin, aula
        )
        SELECT
            id_grupo,
            clave_grupo,
            COALESCE(clave_grupo, 'Sin nombre'),  -- nombre_grupo desde clave si no existe
            COALESCE(
                (SELECT mat_carrera FROM materias WHERE id = grupos_old.id_docente LIMIT 1),
                'ISC'
            ),
            COALESCE(semestre, 1),
            cupo_maximo,
            id_docente,
            horario_dias,
            -- horario_horas viejo (ej: "07:00-09:00") se parte en hora_inicio y hora_fin
            CASE WHEN horario_horas LIKE '%-%'
                 THEN TRIM(SUBSTR(horario_horas, 1, INSTR(horario_horas, '-') - 1))
                 ELSE horario_horas END,
            CASE WHEN horario_horas LIKE '%-%'
                 THEN TRIM(SUBSTR(horario_horas, INSTR(horario_horas, '-') + 1))
                 ELSE NULL END,
            aula
        FROM grupos_old
    `, (err) => {
        if (err) console.log('ℹ️  Sin datos que migrar en grupos:', err.message);
        else console.log('✅ Datos de grupos migrados.');
    });

    // ── 7. Eliminar tablas viejas ──────────────────────────────────────────
    db.run(`DROP TABLE IF EXISTS alumnos_old`, () => console.log('🗑️  alumnos_old eliminada.'));
    db.run(`DROP TABLE IF EXISTS grupos_old`, () => {
        console.log('🗑️  grupos_old eliminada.');
        console.log('\n✅ Migración completada. Ya puedes correr: node server.js');
        db.close();
    });

});