import type { Application } from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

class SwaggerConfig {
  private puerto: string | number;
  private options: swaggerJsDoc.Options;
  public spec: Record<string, unknown>;

  constructor() {
    this.puerto = 3000;
    this.options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API División Política',
          version: '1.0.0',
          description: 'Microservicio orientado a objetos para gestionar geografía mundial (países, regiones/estados/departamentos y ciudades). Soporta operaciones CRUD completas y consultas de capital.',
          contact: {
            name: 'API División Política'
          }
        },
        servers: [
          {
            url: '/',
            description: 'Servidor Actual'
          }
        ],
        tags: [
          { name: 'Países', description: 'Operaciones para consultar y gestionar países' },
          { name: 'Regiones', description: 'Operaciones para departamentos/estados/provincias' },
          { name: 'Ciudades', description: 'Operaciones para ciudades y municipios' }
        ]
      },
      apis: ['./server/rutas/*.ts', './server/rutas/*.js', './rutas/*.js'],
    };
    this.spec = swaggerJsDoc(this.options) as Record<string, unknown>;
  }

  configurar(app: Application) {
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(this.spec);
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.spec, {
      customSiteTitle: 'API División Política - Swagger UI',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      }
    }));
    console.log(`📖 Documentación Swagger disponible en: /api-docs`);
  }
}

export default new SwaggerConfig();
