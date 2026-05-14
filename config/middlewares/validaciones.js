// config/middlewares/validaciones.js
const { body, validationResult } = require('express-validator');

const validarRegistroAlumno = [
    body('numero_control')
        .notEmpty().withMessage('El número de control es obligatorio.')
        .isLength({ min: 8, max: 8 }).withMessage('El número de control debe tener 8 dígitos.')
        .isNumeric().withMessage('El número de control debe contener solo números.')
        .trim().escape(),
    
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio.')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo debe contener letras.')
        .trim().escape(),
        
    body('correo')
        .isEmail().withMessage('Debe proporcionar un correo válido.')
        .normalizeEmail(),
        
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria.')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
];

const validarLogin = [
    body('identificador')
        .notEmpty().withMessage('El identificador (No. de control, RFC o correo) es obligatorio.')
        .trim().escape(),
        
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria.'),
        
    body('tipo')
        .notEmpty().withMessage('El tipo de usuario es obligatorio.')
        .isIn(['alumno', 'docente', 'aspirante', 'personal']).withMessage('Tipo de usuario no válido.')
];

const revisarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ 
            exito: false, 
            errores: errores.array() 
        });
    }
    next();
};

module.exports = {
    validarRegistroAlumno,
    validarLogin,
    revisarErrores
};