const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { identificador, password, tipo } = req.body;
    db.get('SELECT * FROM usuarios WHERE identificador = ? AND tipo = ?', [identificador, tipo], async (err, user) => {
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }
        res.json({ mensaje: "Acceso autorizado", tipo: user.tipo });
    });
};

exports.guardarAspirante = (req, res) => {
    const { curp, nombre, carrera, email } = req.body;
    db.run(`INSERT INTO registros_aspirantes (curp, nombre_completo, carrera_interes, email) VALUES (?,?,?,?)`,
    [curp, nombre, carrera, email], (err) => {
        if (err) return res.status(400).json({ error: "Error en el registro" });
        res.json({ mensaje: "Formulario enviado con éxito" });
    });
};