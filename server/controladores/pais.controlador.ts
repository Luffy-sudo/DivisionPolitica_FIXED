import type { Request, Response } from 'express';
import paisRepositorio from '../repositorios/pais.repositorio.ts';

class PaisControlador {
  async listar(solicitud: Request, respuesta: Response) {
    try {
      const datos = await paisRepositorio.listar();
      return respuesta.json(datos);
    } catch (error) {
      return respuesta.status(500).json({
        mensaje: "Error obteniendo la lista de países"
      });
    }
  }

  async agregar(solicitud: Request, respuesta: Response) {
    try {
      const nuevoPais = await paisRepositorio.agregar(solicitud.body);
      return respuesta.status(201).json(nuevoPais);
    } catch (error) {
      return respuesta.status(500).json({
        mensaje: "Error agregando país"
      });
    }
  }

  async modificar(solicitud: Request, respuesta: Response) {
    try {
      const datos = await paisRepositorio.modificar(solicitud.body);
      return respuesta.json(datos);
    } catch (error) {
      return respuesta.status(500).json({ mensaje: "Error modificando país" });
    }
  }

  async eliminar(solicitud: Request, respuesta: Response) {
    try {
      const { id } = solicitud.params;
      const exito = await paisRepositorio.eliminar(id);
      if (!exito) {
        return respuesta.status(404).json({
          mensaje: "País no encontrado para eliminar"
        });
      }
      return respuesta.json({
        mensaje: "País eliminado correctamente",
        exito: true
      });
    } catch (error) {
      return respuesta.status(500).json({
        mensaje: "Error eliminando país"
      });
    }
  }

  async capital(solicitud: Request, respuesta: Response) {
    try {
      const dato = await paisRepositorio.obtenerCapital(solicitud.params.pais);
      if (!dato) {
        return respuesta.status(404).json({ mensaje: "No se encontró la capital para ese país" });
      }
      return respuesta.json(dato);
    } catch (error) {
      return respuesta.status(500).json({
        mensaje: "Error obteniendo la capital del país"
      });
    }
  }
}

export default new PaisControlador();
