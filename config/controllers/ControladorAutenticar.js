const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.loginPersonal = (req, res) => {
    const { numero_empleado, password } = req.body;

    const sql = `SELECT * FROM personal WHERE numero_empleado = ? AND activo = 1`;
    
    db.get(sql, [numero_empleado], async (err, user) => {
        if (err) return res.status(500).json({ error: "Error en base de datos" });
        if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

        // Comparar password con el hash almacenado
        const esValido = await bcrypt.compare(password, user.password_hash);
        if (!esValido) return res.status(401).json({ error: "Contraseña incorrecta" });

        // Respuesta exitosa (sin enviar el hash)
        res.json({ 
            mensaje: "Acceso exitoso", 
            usuario: { nombre: user.nombre, rol: user.rol } 
        });
    });
};