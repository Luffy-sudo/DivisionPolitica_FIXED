import type { Request, Response } from 'express';
import ciudadRepositorio from '../repositorios/ciudad.repositorio.ts';

class CiudadControlador {
  async listar(req: Request, res: Response) {
    try {
      const { id, region } = req.params;
      const datos = await ciudadRepositorio.listar(parseInt(id), region);
      res.status(200).json(datos);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ mensaje: "Error al obtener ciudades", error: err?.message });
    }
  }

  async agregar(req: Request, res: Response) {
    try {
      const { id, region } = req.params;
      const ciudad = req.body;
      const datos = await ciudadRepositorio.agregar(parseInt(id), region, ciudad);
      res.status(201).json(datos);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ mensaje: "Error al agregar ciudad", error: err?.message });
    }
  }

  async modificar(req: Request, res: Response) {
    try {
      const { id, region } = req.params;
      const ciudad = req.body;
      const datos = await ciudadRepositorio.modificar(parseInt(id), region, ciudad);
      res.status(200).json(datos);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ mensaje: "Error al modificar ciudad", error: err?.message });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const { id, region, nombreCiudad } = req.params;
      const eliminado = await ciudadRepositorio.eliminar(parseInt(id), region, nombreCiudad);

      if (!eliminado) {
        return res.status(404).json({ mensaje: "No se encontró la ciudad para eliminar." });
      }
      res.status(200).json({ mensaje: "Ciudad eliminada correctamente" });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ mensaje: "Error al eliminar ciudad", error: err?.message });
    }
  }
}

export default new CiudadControlador();
