import type { Request, Response, NextFunction } from 'express';

class PaisValidador {
  validarCuerpo = (solicitud: Request, respuesta: Response, next: NextFunction) => {
    const { id, nombre, continente } = solicitud.body;
    const errores: string[] = [];

    if (id === undefined || id === null) errores.push("El campo 'id' es obligatorio.");
    if (!nombre || String(nombre).trim().length < 2) errores.push("El 'nombre' debe tener al menos 2 caracteres.");
    if (!continente) errores.push("El campo 'continente' es obligatorio.");

    if (errores.length > 0) {
      return respuesta.status(400).json({
        mensaje: "Error de validación",
        detalles: errores
      });
    }

    next();
  };

  validarIdParam = (solicitud: Request, respuesta: Response, next: NextFunction) => {
    const id = parseInt(solicitud.params.id);
    if (isNaN(id)) {
      return respuesta.status(400).json({
        mensaje: "El ID proporcionado en la URL debe ser un número válido."
      });
    }
    next();
  };
}

export default new PaisValidador();
