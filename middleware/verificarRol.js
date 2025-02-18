// middleware/verificarRol.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: "Acceso Denegado, el usuario no está logeado" });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            if (!rolesPermitidos.includes(req.user.userRol)) {
                return res.status(403).json({ message: 'Acceso Denegado, No tienes permisos suficientes para realizar esta solicitud' });
            }
            next();
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: "Token no válido" });
        }
    };
}

module.exports = verificarRol;
