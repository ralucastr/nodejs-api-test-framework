const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Client API",
            version: "1.0.0",
            description: "API for managing clients",
        },
        servers: [{ url: "http://localhost:5000" }],
    },
    apis: ["./routes/*.js"], // Path to API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
