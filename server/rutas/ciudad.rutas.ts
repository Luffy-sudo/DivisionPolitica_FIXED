import express, { type Router } from 'express';
import ciudadControlador from '../controladores/ciudad.controlador.ts';
import ciudadValidador from '../validadores/ciudad.validador.ts';

class CiudadRutas {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this._configurarRutas();
  }

  private _configurarRutas() {
    /**
     * @swagger
     * /api/paises/{id}/regiones/{region}/ciudades:
     *   get:
     *     summary: Lista las ciudades de una región
     *     tags: [Ciudades]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID del país
     *       - in: path
     *         name: region
     *         schema:
     *           type: string
     *         required: true
     *         description: Nombre de la región
     *     responses:
     *       200:
     *         description: Lista de ciudades obtenida exitosamente
     */
    this.router.get(
      '/:id/regiones/:region/ciudades',
      ciudadValidador.validarParams,
      (req, res) => ciudadControlador.listar(req, res)
    );

    /**
     * @swagger
     * /api/paises/{id}/regiones/{region}/ciudades:
     *   post:
     *     summary: Agrega una nueva ciudad a una región
     *     tags: [Ciudades]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID del país
     *       - in: path
     *         name: region
     *         schema:
     *           type: string
     *         required: true
     *         description: Nombre de la región
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nombre:
     *                 type: string
     *                 example: "Medellín"
     *               habitantes:
     *                 type: integer
     *                 example: 2500000
     *               esCapital:
     *                 type: boolean
     *                 example: true
     *     responses:
     *       201:
     *         description: Ciudad agregada correctamente
     */
    this.router.post(
      '/:id/regiones/:region/ciudades',
      ciudadValidador.validarParams,
      ciudadValidador.validarCuerpo,
      (req, res) => ciudadControlador.agregar(req, res)
    );

    /**
     * @swagger
     * /api/paises/{id}/regiones/{region}/ciudades:
     *   put:
     *     summary: Modifica una ciudad de una región
     *     tags: [Ciudades]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID del país
     *       - in: path
     *         name: region
     *         schema:
     *           type: string
     *         required: true
     *         description: Nombre de la región
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nombre:
     *                 type: string
     *                 example: "Medellín"
     *               habitantes:
     *                 type: integer
     *                 example: 2600000
     *               esCapital:
     *                 type: boolean
     *                 example: true
     *     responses:
     *       200:
     *         description: Ciudad modificada correctamente
     */
    this.router.put(
      '/:id/regiones/:region/ciudades',
      ciudadValidador.validarParams,
      ciudadValidador.validarCuerpo,
      (req, res) => ciudadControlador.modificar(req, res)
    );

    /**
     * @swagger
     * /api/paises/{id}/regiones/{region}/ciudades/{nombreCiudad}:
     *   delete:
     *     summary: Elimina una ciudad de una región
     *     tags: [Ciudades]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID del país
     *       - in: path
     *         name: region
     *         schema:
     *           type: string
     *         required: true
     *         description: Nombre de la región
     *       - in: path
     *         name: nombreCiudad
     *         schema:
     *           type: string
     *         required: true
     *         description: Nombre de la ciudad
     *     responses:
     *       200:
     *         description: Ciudad eliminada correctamente
     */
    this.router.delete(
      '/:id/regiones/:region/ciudades/:nombreCiudad',
      ciudadValidador.validarParams,
      (req, res) => ciudadControlador.eliminar(req, res)
    );
  }

  get obtenerRouter(): Router {
    return this.router;
  }
}

export default new CiudadRutas().obtenerRouter;
