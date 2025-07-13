import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API OS",
      version: "1.0.0",
      description: "Documentação da sua API",
    },
  },
  apis: ["./routes/*.js"], // caminhos dos arquivos com comentários Swagger
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default setupSwagger;