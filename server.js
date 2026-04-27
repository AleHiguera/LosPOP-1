const express = require('express');
const authController = require('./controllers/authController');
const app = express();

app.use(express.json());

// Ruta para el inicio de sesión
app.post('/api/login-personal', authController.loginPersonal);

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
    console.log('Base de datos SQLite lista en ./instituto.db');
});