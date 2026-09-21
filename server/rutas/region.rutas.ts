import express, { type Router } from 'express';
import regionControlador from '../controladores/region.controlador.ts';
import regionValidador from '../validadores/region.validador.ts';

class RegionRutas {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this._configurarRutas();
  }

  private _configurarRutas() {
    /**
     * @swagger
     * /api/paises/{id}/regiones:
     *   get:
     *     summary: Lista todas las regiones de un país
     *     tags: [Regiones]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del país
     *     responses:
     *       200:
     *         description: Lista de regiones obtenida exitosamente
     */
    this.router.get(
      '/:id/regiones',
      regionValidador.validarIdPaisParam,
      (req, res) => regionControlador.listar(req, res)
    );

    /**
     * @swagger
     * /api/paises/{id}/regiones:
     *   post:
     *     summary: Agrega una nueva región a un país
     *     tags: [Regiones]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID del país
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nombre:
     *                 type: string
     *                 example: "Antioquia"
     *               area:
     *                 type: number
     *                 example: 63612
     *               poblacion:
     *                 type: number
     *                 example: 6677930
     *     responses:
     *       201:
     *         description: Región agregada correctamente
     */
    this.router.post(
      '/:id/regiones',
      regionValidador.validarIdPaisParam,
      regionValidador.validarCuerpo,
      (req, res) => regionControlador.agregar(req, res)
    );

    /**
     * @swagger
     * /api/paises/{id}/regiones:
     *   put:
     *     summary: Modifica una región existente
     *     tags: [Regiones]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID del país
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nombre
     *             properties:
     *               nombre:
     *                 type: string
     *                 example: "Antioquia"
     *               area:
     *                 type: number
     *                 example: 63612
     *               poblacion:
     *                 type: number
     *                 example: 6700000
     *     responses:
     *       200:
     *         description: Región modificada correctamente
     */
    this.router.put(
      '/:id/regiones',
      regionValidador.validarIdPaisParam,
      regionValidador.validarCuerpo,
      (req, res) => regionControlador.modificar(req, res)
    );

    /**
     * @swagger
     * /api/paises/{id}/regiones/{nombre}:
     *   delete:
     *     summary: Elimina una región por nombre
     *     tags: [Regiones]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del país
     *       - in: path
     *         name: nombre
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre de la región
     *     responses:
     *       200:
     *         description: Región eliminada correctamente
     */
    this.router.delete(
      '/:id/regiones/:nombre',
      regionValidador.validarIdPaisParam,
      regionValidador.validarNombreParam,
      (req, res) => regionControlador.eliminar(req, res)
    );
  }

  get obtenerRouter(): Router {
    return this.router;
  }
}

export default new RegionRutas().obtenerRouter;
