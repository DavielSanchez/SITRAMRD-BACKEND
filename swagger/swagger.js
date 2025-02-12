const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SITRAMRD API",
            version: "0.0.1",
            description: "API para la aplicación de SITRAMRD.",
            contact: {
                name: "Daviel Sanchez",
            },
        },
        servers: [{
                url: "https://strong-olympia-sitramrd-b5afe725.koyeb.app",
                description: "API desplegada"
            },
            {
                url: "http://localhost:3001",
                description: "Local host"
            },
        ]
    },
    apis: ["./Endpoints/*.js", "./index.js"]
};

const specs = swaggerJsdoc(options);
module.exports = specs;