import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import conexionBD from './server/repositorios/bd.ts';
import paisRutas from './server/rutas/pais.rutas.ts';
import regionRutas from './server/rutas/region.rutas.ts';
import ciudadRutas from './server/rutas/ciudad.rutas.ts';
import swaggerConfig from './server/configuracion/swagger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Database
  try {
    await conexionBD.conectar();
  } catch (error) {
    console.error("Fallo crítico: No se pudo iniciar la base de datos:", error);
    process.exit(1);
  }

  // Swagger Documentation
  swaggerConfig.configurar(app);

  // Health and Info API
  app.get('/api/estado', (req, res) => {
    res.json({
      estado: "Online",
      servicio: "API División Política",
      version: "1.0.0",
      swagger: "/api-docs",
      rutas: [
        { metodo: "GET", path: "/api/paises", descripcion: "Listar todos los países" },
        { metodo: "POST", path: "/api/paises", descripcion: "Crear un país" },
        { metodo: "PUT", path: "/api/paises", descripcion: "Actualizar un país" },
        { metodo: "DELETE", path: "/api/paises/:id", descripcion: "Eliminar un país" },
        { metodo: "GET", path: "/api/paises/capital/:pais", descripcion: "Obtener capital de un país" },
        { metodo: "GET", path: "/api/paises/:id/regiones", descripcion: "Listar regiones de un país" },
        { metodo: "POST", path: "/api/paises/:id/regiones", descripcion: "Agregar región a un país" },
        { metodo: "PUT", path: "/api/paises/:id/regiones", descripcion: "Modificar región de un país" },
        { metodo: "DELETE", path: "/api/paises/:id/regiones/:nombre", descripcion: "Eliminar región" },
        { metodo: "GET", path: "/api/paises/:id/regiones/:region/ciudades", descripcion: "Listar ciudades de una región" },
        { metodo: "POST", path: "/api/paises/:id/regiones/:region/ciudades", descripcion: "Agregar ciudad a una región" },
        { metodo: "PUT", path: "/api/paises/:id/regiones/:region/ciudades", descripcion: "Modificar ciudad" },
        { metodo: "DELETE", path: "/api/paises/:id/regiones/:region/ciudades/:nombreCiudad", descripcion: "Eliminar ciudad" }
      ]
    });
  });

  // Database Reset endpoint
  app.post('/api/reiniciar-datos', (req, res) => {
    conexionBD.reiniciarDatos();
    res.json({ mensaje: "Base de datos restablecida correctamente con el seed original de 249 países." });
  });

  // REST API Routes
  app.use('/api/paises', paisRutas);
  app.use('/api/paises', regionRutas);
  app.use('/api/paises', ciudadRutas);

  // Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 API División Política y Frontend corriendo en http://localhost:${PORT}`);
    console.log(`📖 Swagger UI disponible en http://localhost:${PORT}/api-docs`);
  });
}

startServer();
