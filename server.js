const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ─── Conexión a la base de datos ────────────────────────────────────────────
const db = new sqlite3.Database('./instituto.db', (err) => {
    if (err) console.error('Error al conectar DB:', err.message);
    else console.log('✅ Conectado a instituto.db');
});

// Middleware auxiliar para revisar errores de express-validator
const revisarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ error: 'Errores de validación', detalles: errores.array() });
    }
    next();
};

// ════════════════════════════════════════════════════════════════════════════
// ALUMNOS
// ════════════════════════════════════════════════════════════════════════════

// POST /api/alumnos — Registrar nuevo alumno (AHORA CON VALIDACIONES)
app.post('/api/alumnos', [
    // Validaciones de seguridad
    body('numero_control').isLength({ min: 8 }).withMessage('El número de control debe tener al menos 8 caracteres.').trim().escape(),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio.').trim().escape(),
    body('apellido_paterno').notEmpty().withMessage('El apellido paterno es obligatorio.').trim().escape(),
    body('carrera').notEmpty().withMessage('La carrera es obligatoria.').trim().escape(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
], revisarErrores, async (req, res) => {
    
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

// GET /api/alumnos — Listar todos los alumnos
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

// GET /api/alumnos/:numero_control — Obtener alumno
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

app.post('/api/grupos', [
    body('clave_grupo').notEmpty().trim().escape(),
    body('nombre_grupo').notEmpty().trim().escape(),
    body('carrera').notEmpty().trim().escape(),
    body('semestre').isInt()
], revisarErrores, (req, res) => {
    const {
        clave_grupo, nombre_grupo, carrera, semestre,
        periodo, cupo_maximo, fecha_inicio, fecha_fin,
        id_materia, id_docente,
        horario_dias, hora_inicio, hora_fin, aula,
        estado, modalidad, observaciones
    } = req.body;

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
            return res.status(500).json({ error: 'Error en la base de datos.', detalle: err.message });
        }
        res.status(201).json({ mensaje: 'Grupo registrado con éxito', id_grupo: this.lastID, clave_grupo });
    });
});

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
// CATÁLOGOS Y DOCENTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/docentes', (req, res) => {
    db.all('SELECT id, doc_num, doc_nombre FROM docentes ORDER BY doc_nombre', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

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

app.post('/api/registrar-docente', [
    body('doc_num').notEmpty().trim().escape(),
    body('doc_nombre').notEmpty().trim().escape()
], revisarErrores, (req, res) => {
    const { doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo } = req.body;
    const sql = `INSERT INTO docentes (doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo) VALUES (?, ?, ?, ?, ?)`;
    const params = [doc_num, doc_nombre, doc_rfc || null, doc_depto || null, doc_correo || null];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) return res.status(409).json({ error: 'El número de empleado ya está registrado.' });
            return res.status(500).json({ error: 'Error en la base de datos.', detalle: err.message });
        }
        res.status(201).json({ mensaje: 'Docente registrado con éxito', id: this.lastID });
    });
});

app.post('/api/registrar-materia', [
    body('mat_clave').notEmpty().trim().escape(),
    body('mat_nombre').notEmpty().trim().escape()
], revisarErrores, (req, res) => {
    const { mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total } = req.body;
    const sql = `INSERT INTO materias (mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [ mat_clave, mat_nombre, mat_corto || null, mat_creditos, mat_carrera, mat_semestre, horas_t || 0, horas_p || 0, horas_total || 0 ];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) return res.status(409).json({ error: 'La clave de materia ya existe.' });
            return res.status(500).json({ error: 'Error en la base de datos.', detalle: err.message });
        }
        res.status(201).json({ mensaje: 'Materia registrada con éxito', id: this.lastID });
    });
});


// ════════════════════════════════════════════════════════════════════════════
// ASIGNACIÓN DE DOCENTES, GRUPOS Y HORARIOS (NUEVO)
// ════════════════════════════════════════════════════════════════════════════

// 1. Crear Asignación (Relación Docente-Grupo-Materia)
app.post('/api/asignar-docente', [
    body('id_docente').isInt().withMessage('Se requiere ID de docente válido.'),
    body('id_grupo').isInt().withMessage('Se requiere ID de grupo válido.'),
    body('id_materia').isInt().withMessage('Se requiere ID de materia válido.')
], revisarErrores, (req, res) => {
    const { id_docente, id_grupo, id_materia } = req.body;

    const sql = `INSERT INTO docente_grupo (id_docente, id_grupo, id_materia) VALUES (?, ?, ?)`;
    db.run(sql, [id_docente, id_grupo, id_materia], function(err) {
        if (err) return res.status(500).json({ error: 'Error al crear la asignación.', detalle: err.message });
        res.status(201).json({ mensaje: 'Relación docente-grupo creada exitosamente', id_asignacion: this.lastID });
    });
});

// 2. Registrar Horario (Con validación de colisiones)
app.post('/api/registrar-horario', [
    body('id_asignacion').isInt().withMessage('Se requiere ID de asignación válido.'),
    body('dia_semana').notEmpty().trim().escape(),
    body('hora_inicio').notEmpty().trim().escape(),
    body('hora_fin').notEmpty().trim().escape(),
    body('aula').notEmpty().trim().escape()
], revisarErrores, (req, res) => {
    const { id_asignacion, dia_semana, hora_inicio, hora_fin, aula } = req.body;

    // Validación de lógica de negocio para evitar empalmes
    const sqlCheck = `
        SELECT h.id_horario, h.aula, dg.id_docente, dg.id_grupo
        FROM horarios h
        JOIN docente_grupo dg ON h.id_asignacion = dg.id_asignacion
        WHERE h.dia_semana = ?
        AND (
            (h.hora_inicio < ? AND h.hora_fin > ?) 
            OR (h.hora_inicio < ? AND h.hora_fin > ?) 
            OR (? <= h.hora_inicio AND ? >= h.hora_fin)
        )
    `;

    db.all(sqlCheck, [dia_semana, hora_fin, hora_inicio, hora_inicio, hora_fin, hora_inicio, hora_fin], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error comprobando disponibilidad.', detalle: err.message });

        db.get(`SELECT id_docente, id_grupo FROM docente_grupo WHERE id_asignacion = ?`, [id_asignacion], (err, current) => {
            if (err) return res.status(500).json({ error: 'Error obteniendo datos de asignación.' });
            if (!current) return res.status(404).json({ error: 'La asignación no existe.' });

            // Verificar cruces en los resultados
            for (let row of rows) {
                if (row.aula === aula) {
                    return res.status(409).json({ error: `Conflicto: El aula ${aula} ya está ocupada el ${dia_semana} de ${row.hora_inicio} a ${row.hora_fin}.` });
                }
                if (row.id_docente === current.id_docente) {
                    return res.status(409).json({ error: `Conflicto: El docente ya tiene otra clase asignada el ${dia_semana} a esa hora.` });
                }
                if (row.id_grupo === current.id_grupo) {
                    return res.status(409).json({ error: `Conflicto: El grupo ya tiene otra materia asignada el ${dia_semana} a esa hora.` });
                }
            }

            // Inserción segura si no hay empalmes
            const sqlInsert = `INSERT INTO horarios (id_asignacion, dia_semana, hora_inicio, hora_fin, aula) VALUES (?, ?, ?, ?, ?)`;
            db.run(sqlInsert, [id_asignacion, dia_semana, hora_inicio, hora_fin, aula], function(err) {
                if (err) return res.status(500).json({ error: 'Error al registrar horario', detalle: err.message });
                res.status(201).json({ mensaje: 'Horario registrado exitosamente', id_horario: this.lastID });
            });
        });
    });
});

// 3. Consultar Carga Horaria de un Docente Específico
app.get('/api/horarios/docente/:id_docente', (req, res) => {
    const sql = `
        SELECT dg.id_asignacion, m.mat_nombre AS materia, g.nombre_grupo AS grupo, 
               h.dia_semana, h.hora_inicio, h.hora_fin, h.aula
        FROM docente_grupo dg
        JOIN materias m ON dg.id_materia = m.id
        JOIN grupos g ON dg.id_grupo = g.id_grupo
        JOIN horarios h ON dg.id_asignacion = h.id_asignacion
        WHERE dg.id_docente = ?
        ORDER BY h.dia_semana, h.hora_inicio
    `;
    db.all(sql, [req.params.id_docente], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener carga horaria.', detalle: err.message });
        res.json({
            id_docente: req.params.id_docente,
            total_clases: rows.length,
            horarios: rows
        });
    });
});


// ════════════════════════════════════════════════════════════════════════════
// SISTEMA DE LOGIN Y AUTENTICACIÓN
// ════════════════════════════════════════════════════════════════════════════

app.post('/api/login', [
    body('numero_control').notEmpty().withMessage('El número de control es obligatorio').trim().escape(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
], revisarErrores, (req, res) => {
    const { numero_control, password } = req.body;

    // Busca al alumno por su número de control
    db.get('SELECT * FROM alumnos WHERE numero_control = ?', [numero_control], async (err, usuario) => {
        if (err) return res.status(500).json({ error: "Error en el servidor al buscar usuario" });
        
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Compara la contraseña enviada con el hash guardado en la base de datos
        const coincide = await bcrypt.compare(password, usuario.password_hash);
        
        if (!coincide) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }

        // Si la contraseña es correcta, permite el acceso
        res.json({ 
            mensaje: "Acceso autorizado", 
            usuario: { 
                id_alumno: usuario.id_alumno, 
                nombre: usuario.nombre,
                apellido_paterno: usuario.apellido_paterno,
                carrera: usuario.carrera 
            } 
        });
    });
});

// ─── Iniciar servidor ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});