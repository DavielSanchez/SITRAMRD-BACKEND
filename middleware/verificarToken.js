// Nota para el desarrollador que lea esto: Este middleware permite saber si el usuario ha iniciado sesion, y tambien mediante este middleware estoy obteniendo el ID del usuario

const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
}

module.exports = verificarToken;
