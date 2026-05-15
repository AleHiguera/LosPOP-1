// config/controllers/ControladorHorarios.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Crear Asignación Docente-Grupo-Materia
router.post('/asignar', (req, res) => {
    const { id_docente, id_grupo, id_materia } = req.body;

    if (!id_docente || !id_grupo || !id_materia) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para la asignación.' });
    }

    const sql = `INSERT INTO docente_grupo (id_docente, id_grupo, id_materia) VALUES (?, ?, ?)`;
    db.run(sql, [id_docente, id_grupo, id_materia], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ mensaje: 'Relación docente-grupo creada', id_asignacion: this.lastID });
    });
});

// 2. Registrar Horario con Validación de Colisiones
router.post('/registrar', (req, res) => {
    const { id_asignacion, dia_semana, hora_inicio, hora_fin, aula } = req.body;

    // Validación de lógica de negocio: Evitar empalmes
    // Comprobamos si el aula está ocupada O si el docente ya tiene clase en ese momento O si el grupo ya tiene clase
    const sqlCheck = `
        SELECT h.id_horario, h.aula, dg.id_docente, dg.id_grupo
        FROM horarios h
        JOIN docente_grupo dg ON h.id_asignacion = dg.id_asignacion
        WHERE h.dia_semana = ?
        AND (
            (h.hora_inicio < ? AND h.hora_fin > ?) -- El nuevo horario empieza durante una clase existente
            OR (h.hora_inicio < ? AND h.hora_fin > ?) -- El nuevo horario termina durante una clase existente
            OR (? <= h.hora_inicio AND ? >= h.hora_fin) -- El nuevo horario envuelve a uno existente
        )
    `;

    db.all(sqlCheck, [dia_semana, hora_fin, hora_inicio, hora_inicio, hora_fin, hora_inicio, hora_fin], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Obtener datos de la asignación actual para comparar
        db.get(`SELECT id_docente, id_grupo FROM docente_grupo WHERE id_asignacion = ?`, [id_asignacion], (err, current) => {
            
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

            // Si pasa las validaciones, insertamos
            const sqlInsert = `INSERT INTO horarios (id_asignacion, dia_semana, hora_inicio, hora_fin, aula) VALUES (?, ?, ?, ?, ?)`;
            db.run(sqlInsert, [id_asignacion, dia_semana, hora_inicio, hora_fin, aula], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ mensaje: 'Horario registrado exitosamente', id_horario: this.lastID });
            });
        });
    });
});

// 3. Consultar Carga Horaria de un Docente
router.get('/docente/:id', (req, res) => {
    const sql = `
        SELECT dg.id_asignacion, m.mat_nombre, g.nombre_grupo, h.dia_semana, h.hora_inicio, h.hora_fin, h.aula
        FROM docente_grupo dg
        JOIN materias m ON dg.id_materia = m.id
        JOIN grupos g ON dg.id_grupo = g.id_grupo
        JOIN horarios h ON dg.id_asignacion = h.id_asignacion
        WHERE dg.id_docente = ?
        ORDER BY h.dia_semana, h.hora_inicio
    `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;