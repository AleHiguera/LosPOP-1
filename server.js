const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ─── Conexión a la base de datos ────────────────────────────────────────────
const db = new sqlite3.Database('./instituto.db', (err) => {
    if (err) console.error('Error al conectar DB:', err.message);
    else console.log('✅ Conectado a instituto.db');
});

// ════════════════════════════════════════════════════════════════════════════
// ALUMNOS
// ════════════════════════════════════════════════════════════════════════════

// POST /api/alumnos — Registrar nuevo alumno
app.post('/api/alumnos', async (req, res) => {
    const {
        numero_control, curp, nombre, apellido_paterno, apellido_materno,
        fecha_nacimiento, sexo, estado_civil,
        telefono_casa, telefono_celular, correo,
        direccion, ciudad, codigo_postal,
        escuela_procedencia, promedio_bachiller, anio_egreso,
        carrera, semestre, periodo_inscripcion, fecha_inscripcion,
        tipo_ingreso, beca,
        tutor_nombre, tutor_telefono, tutor_parentesco, tutor_correo,
        estado, credencial_vigente,
        password
    } = req.body;

    // Validación de campos obligatorios
    const requeridos = { numero_control, nombre, apellido_paterno, carrera, password };
    const faltantes = Object.keys(requeridos).filter(k => !requeridos[k]);
    if (faltantes.length > 0) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios',
            campos: faltantes
        });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO alumnos (
                numero_control, curp, nombre, apellido_paterno, apellido_materno,
                fecha_nacimiento, sexo, estado_civil,
                telefono_casa, telefono_celular, correo,
                direccion, ciudad, codigo_postal,
                escuela_procedencia, promedio_bachiller, anio_egreso,
                carrera, semestre, periodo_inscripcion, fecha_inscripcion,
                tipo_ingreso, beca,
                tutor_nombre, tutor_telefono, tutor_parentesco, tutor_correo,
                estado, credencial_vigente, password_hash
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?
            )`;

        const params = [
            numero_control, curp || null, nombre, apellido_paterno, apellido_materno || null,
            fecha_nacimiento || null, sexo || null, estado_civil || null,
            telefono_casa || null, telefono_celular || null, correo || null,
            direccion || null, ciudad || null, codigo_postal || null,
            escuela_procedencia || null, promedio_bachiller || null, anio_egreso || null,
            carrera, semestre || 1, periodo_inscripcion || null, fecha_inscripcion || null,
            tipo_ingreso || 'N', beca || 'N',
            tutor_nombre || null, tutor_telefono || null, tutor_parentesco || null, tutor_correo || null,
            estado || 'A', credencial_vigente || 'S', password_hash
        ];

        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    // Identificar qué campo está duplicado
                    const campo = err.message.includes('numero_control') ? 'Número de control'
                                : err.message.includes('curp')           ? 'CURP'
                                : err.message.includes('correo')         ? 'Correo electrónico'
                                : 'Un campo único';
                    return res.status(409).json({ error: `${campo} ya está registrado.` });
                }
                console.error('DB error:', err.message);
                return res.status(500).json({ error: 'Error en la base de datos.', detalle: err.message });
            }
            res.status(201).json({
                mensaje: 'Alumno registrado con éxito',
                id_alumno: this.lastID,
                numero_control
            });
        });

    } catch (error) {
        console.error('Error hash:', error.message);
        res.status(500).json({ error: 'Error al procesar la contraseña.' });
    }
});

// GET /api/alumnos — Listar todos los alumnos (sin password_hash)
app.get('/api/alumnos', (req, res) => {
    const sql = `
        SELECT id_alumno, numero_control, curp, nombre,
               apellido_paterno, apellido_materno, carrera,
               semestre, correo, estado
        FROM alumnos ORDER BY apellido_paterno, nombre`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/alumnos/:numero_control — Obtener alumno por número de control
app.get('/api/alumnos/:numero_control', (req, res) => {
    const sql = `
        SELECT id_alumno, numero_control, curp, nombre,
               apellido_paterno, apellido_materno, fecha_nacimiento,
               sexo, estado_civil, telefono_casa, telefono_celular,
               correo, direccion, ciudad, codigo_postal,
               escuela_procedencia, promedio_bachiller, anio_egreso,
               carrera, semestre, periodo_inscripcion, fecha_inscripcion,
               tipo_ingreso, beca, tutor_nombre, tutor_telefono,
               tutor_parentesco, tutor_correo, estado, credencial_vigente
        FROM alumnos WHERE numero_control = ?`;

    db.get(sql, [req.params.numero_control], (err, row) => {
        if (err)  return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Alumno no encontrado.' });
        res.json(row);
    });
});


// ════════════════════════════════════════════════════════════════════════════
// GRUPOS
// ════════════════════════════════════════════════════════════════════════════

// POST /api/grupos — Registrar nuevo grupo
app.post('/api/grupos', (req, res) => {
    const {
        clave_grupo, nombre_grupo, carrera, semestre,
        periodo, cupo_maximo, fecha_inicio, fecha_fin,
        id_materia, id_docente,
        horario_dias, hora_inicio, hora_fin, aula,
        estado, modalidad, observaciones
    } = req.body;

    // Validación de campos obligatorios
    const requeridos = { clave_grupo, nombre_grupo, carrera, semestre };
    const faltantes = Object.keys(requeridos).filter(k => !requeridos[k]);
    if (faltantes.length > 0) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios',
            campos: faltantes
        });
    }

    const sql = `
        INSERT INTO grupos (
            clave_grupo, nombre_grupo, carrera, semestre,
            periodo, cupo_maximo, fecha_inicio, fecha_fin,
            id_materia, id_docente,
            horario_dias, hora_inicio, hora_fin, aula,
            estado, modalidad, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        clave_grupo, nombre_grupo, carrera, semestre,
        periodo || null, cupo_maximo || null, fecha_inicio || null, fecha_fin || null,
        id_materia || null, id_docente || null,
        horario_dias || null, hora_inicio || null, hora_fin || null, aula || null,
        estado || 'Activo', modalidad || 'Presencial', observaciones || null
    ];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'La clave de grupo ya existe.' });
            }
            console.error('DB error:', err.message);
            return res.status(500).json({ error: 'Error en la base de datos.', detalle: err.message });
        }
        res.status(201).json({
            mensaje: 'Grupo registrado con éxito',
            id_grupo: this.lastID,
            clave_grupo
        });
    });
});

// GET /api/grupos — Listar todos los grupos
app.get('/api/grupos', (req, res) => {
    const sql = `
        SELECT g.id_grupo, g.clave_grupo, g.nombre_grupo, g.carrera,
               g.semestre, g.periodo, g.cupo_maximo,
               g.horario_dias, g.hora_inicio, g.hora_fin, g.aula,
               g.estado, g.modalidad,
               m.mat_nombre AS materia,
               d.doc_nombre AS docente
        FROM grupos g
        LEFT JOIN materias m ON g.id_materia = m.id
        LEFT JOIN docentes d ON g.id_docente = d.id
        ORDER BY g.carrera, g.semestre, g.clave_grupo`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/grupos/:id — Obtener grupo por ID
app.get('/api/grupos/:id', (req, res) => {
    const sql = `
        SELECT g.*, m.mat_nombre AS materia, d.doc_nombre AS docente
        FROM grupos g
        LEFT JOIN materias m ON g.id_materia = m.id
        LEFT JOIN docentes d ON g.id_docente = d.id
        WHERE g.id_grupo = ?`;

    db.get(sql, [req.params.id], (err, row) => {
        if (err)  return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Grupo no encontrado.' });
        res.json(row);
    });
});

// ════════════════════════════════════════════════════════════════════════════
// CATÁLOGOS (para poblar los <select> de los formularios)
// ════════════════════════════════════════════════════════════════════════════

// GET /api/docentes — Lista de docentes para el select del formulario de grupos
app.get('/api/docentes', (req, res) => {
    db.all('SELECT id, doc_num, doc_nombre FROM docentes ORDER BY doc_nombre', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/materias — Lista de materias para el select del formulario de grupos
app.get('/api/materias', (req, res) => {
    const { carrera, semestre } = req.query;
    let sql = 'SELECT id, mat_clave, mat_nombre, mat_carrera, mat_semestre FROM materias';
    const params = [];

    if (carrera && semestre) {
        sql += ' WHERE mat_carrera = ? AND mat_semestre = ?';
        params.push(carrera, semestre);
    } else if (carrera) {
        sql += ' WHERE mat_carrera = ?';
        params.push(carrera);
    }
    sql += ' ORDER BY mat_nombre';

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── Iniciar servidor ────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});