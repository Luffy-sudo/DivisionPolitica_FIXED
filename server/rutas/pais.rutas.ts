import express, { type Router } from 'express';
import paisControlador from '../controladores/pais.controlador.ts';
import paisValidador from '../validadores/pais.validador.ts';

class PaisRutas {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this._configurarRutas();
  }

  private _configurarRutas() {
    /**
     * @swagger
     * /api/paises:
     *   get:
     *     summary: Obtiene todos los países
     *     tags:
     *       - Países
     *     responses:
     *       200:
     *         description: Lista de países
     */
    this.router.get('/', (req, res) => paisControlador.listar(req, res));

    /**
     * @swagger
     * /api/paises:
     *   post:
     *     summary: Agregar un nuevo país
     *     description: Agrega un nuevo país al sistema
     *     tags:
     *       - Países
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: integer
     *                 example: 1
     *               nombre:
     *                 type: string
     *                 example: "Colombia"
     *               continente:
     *                 type: string
     *                 example: "AMERICA"
     *               tipoRegion:
     *                 type: string
     *                 example: "Departamento"
     *               codigoAlfa2:
     *                 type: string
     *                 example: "CO"
     *               codigoAlfa3:
     *                 type: string
     *                 example: "COL"
     *     responses:
     *       200:
     *         description: País agregado exitosamente
     *       400:
     *         description: Error en la solicitud
     *       500:
     *         description: Error interno del servidor
     */
    this.router.post(
      '/',
      paisValidador.validarCuerpo,
      (req, res) => paisControlador.agregar(req, res)
    );

    /**
     * @swagger
     * /api/paises:
     *   put:
     *     summary: Modificar un país existente
     *     description: Modifica un país en el sistema
     *     tags:
     *       - Países
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: integer
     *                 example: 1
     *               nombre:
     *                 type: string
     *                 example: "Colombia"
     *               continente:
     *                 type: string
     *                 example: "AMERICA"
     *               tipoRegion:
     *                 type: string
     *                 example: "Departamento"
     *               codigoAlfa2:
     *                 type: string
     *                 example: "CO"
     *               codigoAlfa3:
     *                 type: string
     *                 example: "COL"
     *     responses:
     *       200:
     *         description: País modificado exitosamente
     *       400:
     *         description: Error en la solicitud
     *       404:
     *         description: País no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    this.router.put(
      '/',
      paisValidador.validarCuerpo,
      (req, res) => paisControlador.modificar(req, res)
    );

    /**
     * @swagger
     * /api/paises/{id}:
     *   delete:
     *     summary: Elimina un país por ID
     *     tags:
     *       - Países
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID del país a eliminar
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: País eliminado correctamente
     *       404:
     *         description: País no encontrado
     *       500:
     *         description: Error en el servidor
     */
    this.router.delete(
      '/:id',
      paisValidador.validarIdParam,
      (req, res) => paisControlador.eliminar(req, res)
    );

    /**
     * @swagger
     * /api/paises/capital/{pais}:
     *   get:
     *     summary: Obtener la capital de un país
     *     description: Retorna la capital del país especificado en el parámetro.
     *     tags:
     *       - Países
     *     parameters:
     *       - in: path
     *         name: pais
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre del país
     *     responses:
     *       200:
     *         description: Capital del país obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ciudad:
     *                   type: string
     *                   example: Bogotá
     *                 estado:
     *                   type: string
     *                   example: Bogotá
     *       404:
     *         description: País no encontrado
     *       500:
     *         description: Error del servidor
     */
    this.router.get('/capital/:pais', (req, res) => paisControlador.capital(req, res));
  }

  get obtenerRouter(): Router {
    return this.router;
  }
}

export default new PaisRutas().obtenerRouter;
