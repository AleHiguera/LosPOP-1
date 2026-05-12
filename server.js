const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para guardar Docente
app.post('/api/registrar-docente', (req, res) => {
    const { doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo } = req.body;
    const sql = `INSERT INTO docentes (doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [doc_num, doc_nombre, doc_rfc, doc_depto, doc_correo], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: '¡Docente registrado correctamente!' });
    });
});

// Endpoint para guardar Materia
app.post('/api/registrar-materia', (req, res) => {
    const { mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total } = req.body;
    const sql = `INSERT INTO materias (mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [mat_clave, mat_nombre, mat_corto, mat_creditos, mat_carrera, mat_semestre, horas_t, horas_p, horas_total], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Materia registrada con éxito!' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor SII activo en http://localhost:${PORT}`);
});