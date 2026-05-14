const db = require('../db');
const bcrypt = require('bcrypt');

// ─── 1. LOGIN CENTRALIZADO ──────────────────────────────────────────────────
exports.login = async (req, res) => {
    const { identificador, password, tipo } = req.body;

    db.get('SELECT * FROM usuarios WHERE identificador = ? AND tipo = ?', [identificador, tipo], async (err, user) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        // Aquí podrías enviar datos adicionales del perfil dependiendo del tipo
        res.json({ 
            mensaje: "Acceso autorizado", 
            usuario: { identificador: user.identificador, tipo: user.tipo } 
        });
    });
};

// ─── 2. REGISTRO DE ASPIRANTES (Formulario Externo) ──────────────────────────
exports.guardarAspirante = (req, res) => {
    const { curp, nombre, carrera, email } = req.body;
    
    db.run(`INSERT INTO registros_aspirantes (curp, nombre_completo, carrera_interes, email) VALUES (?,?,?,?)`,
    [curp, nombre, carrera, email], (err) => {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "La CURP ya está registrada" });
            return res.status(400).json({ error: "Error en el registro" });
        }
        res.json({ mensaje: "Formulario enviado con éxito" });
    });
};

// ─── 3. REGISTRO DE ALUMNOS (Crea perfil y credenciales) ─────────────────────
exports.registrarAlumno = async (req, res) => {
    const { numero_control, nombre, correo, password } = req.body;
    const saltRounds = 10;

    try {
        const hash = await bcrypt.hash(password, saltRounds);

        // Iniciamos una transacción manual o ejecución secuencial
        db.serialize(() => {
            // Insertar en tabla alumnos
            db.run(`INSERT INTO alumnos (numero_control, nombre, correo, password) VALUES (?,?,?,?)`, 
            [numero_control, nombre, correo, hash]);

            // Insertar en tabla usuarios para permitir el login
            db.run(`INSERT INTO usuarios (identificador, password_hash, tipo) VALUES (?,?,?)`, 
            [numero_control, hash, 'alumno'], (err) => {
                if (err) return res.status(400).json({ error: "El alumno ya existe o error en credenciales" });
                res.status(201).json({ mensaje: "Alumno registrado correctamente" });
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar el registro" });
    }
};

// ─── 4. REGISTRO DE DOCENTES ────────────────────────────────────────────────
exports.registrarDocente = async (req, res) => {
    const { doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo, password } = req.body;
    const saltRounds = 10;

    try {
        const hash = await bcrypt.hash(password, saltRounds);

        db.serialize(() => {
            db.run(`INSERT INTO docentes (doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo) VALUES (?,?,?,?,?)`,
            [doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo]);

            db.run(`INSERT INTO usuarios (identificador, password_hash, tipo) VALUES (?,?,?)`,
            [doc_num, hash, 'docente'], (err) => {
                if (err) return res.status(400).json({ error: "Error al crear credenciales del docente" });
                res.status(201).json({ mensaje: "Docente registrado con éxito" });
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar docente" });
    }
};

// ─── 5. REGISTRO DE MATERIAS ────────────────────────────────────────────────
exports.registrarMateria = (req, res) => {
    const { mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total } = req.body;

    const query = `INSERT INTO materias (mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total) 
                   VALUES (?,?,?,?,?,?,?,?,?)`;

    db.run(query, [mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total], (err) => {
        if (err) return res.status(400).json({ error: "Error al registrar la materia. Verifique que la clave sea única." });
        res.json({ mensaje: "Materia registrada correctamente" });
    });
};

// ─── 6. REGISTRO DE GRUPOS ──────────────────────────────────────────────────
exports.registrarGrupo = (req, res) => {
    const { clave_grupo, mat_clave, doc_num, cupo } = req.body;

    db.run(`INSERT INTO grupos (clave_grupo, mat_clave, doc_num, cupo) VALUES (?,?,?,?)`,
    [clave_grupo, mat_clave, doc_num, cupo], (err) => {
        if (err) return res.status(400).json({ error: "Error al crear el grupo. Verifique claves de materia y docente." });
        res.json({ mensaje: "Grupo creado con éxito" });
    });
};   