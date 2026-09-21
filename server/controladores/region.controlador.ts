import type { Request, Response } from 'express';
import regionRepositorio from '../repositorios/region.repositorio.ts';

class RegionControlador {
  async listar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const datos = await regionRepositorio.listar(id);
      res.status(200).json(datos);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        mensaje: "Error obteniendo la lista de regiones",
        error: err?.message
      });
    }
  }

  async agregar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const region = req.body;
      if (!region || Object.keys(region).length === 0) {
        return res.status(400).json({ mensaje: "El contenido de la solicitud debe incluir la región" });
      }
      const datos = await regionRepositorio.agregar(id, region);
      res.status(201).json(datos);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        mensaje: "Error agregando región",
        error: err?.message
      });
    }
  }

  async modificar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const region = req.body;
      if (!region || !region.nombre) {
        return res.status(400).json({ mensaje: "Debe incluir el nombre de la región a modificar" });
      }
      const datos = await regionRepositorio.modificar(id, region);
      res.status(200).json(datos);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        mensaje: "Error modificando región",
        error: err?.message
      });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const { id, nombre } = req.params;
      const eliminado = await regionRepositorio.eliminar(id, nombre);

      if (!eliminado) {
        return res.status(404).json({ mensaje: "Región no encontrada para eliminar" });
      }
      res.status(200).json({ mensaje: "Región eliminada correctamente", nombre });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({
        mensaje: "Error eliminando región",
        error: err?.message
      });
    }
  }
}

export default new RegionControlador();
