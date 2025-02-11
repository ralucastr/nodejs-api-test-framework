import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API Documentation",
        version: "1.0.0",
        description: "API for authentication, clients, and orders",
    },
    components: {
        securitySchemes: {
            BearerAuth: {  // 👈 Define JWT authentication
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    security: [{ BearerAuth: [] }], // 👈 Apply globally (optional)
};

const options = {
    swaggerDefinition,
    apis: ["./routes/*.js"]
};

const swaggerDocs = swaggerJsDoc(options);

export default { swaggerUi, swaggerDocs };
// The swaggerDocs object is passed to the swaggerUi middleware in index.js to serve the Swagger UI.