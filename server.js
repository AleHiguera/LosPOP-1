const express = require('express');
const cors = require('cors');
const auth = require('./controllers/ControladorAutenticar');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/login', auth.login);
app.post('/api/aspirante/registrar', auth.guardarAspirante);

app.listen(3000, () => console.log('Servidor activo en http://localhost:3000'));