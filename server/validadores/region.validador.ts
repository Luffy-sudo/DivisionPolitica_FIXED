import type { Request, Response, NextFunction } from 'express';

class RegionValidador {
  validarCuerpo = (solicitud: Request, respuesta: Response, next: NextFunction) => {
    const { nombre, area, poblacion } = solicitud.body;
    const errores: string[] = [];

    if (!nombre || String(nombre).trim().length < 3) {
      errores.push("El 'nombre' de la región es obligatorio y debe tener al menos 3 caracteres.");
    }

    if (area === undefined || isNaN(Number(area)) || Number(area) < 0) {
      errores.push("El campo 'area' es obligatorio y debe ser un número positivo.");
    }

    if (poblacion === undefined || isNaN(Number(poblacion)) || Number(poblacion) < 0) {
      errores.push("El campo 'poblacion' es obligatorio (puede ser 0).");
    }

    if (errores.length > 0) {
      return respuesta.status(400).json({
        mensaje: "Error de validación en la región",
        detalles: errores
      });
    }

    next();
  };

  validarIdPaisParam = (solicitud: Request, respuesta: Response, next: NextFunction) => {
    const id = parseInt(solicitud.params.id);
    if (isNaN(id)) {
      return respuesta.status(400).json({
        mensaje: "El ID del país en la URL debe ser un número válido."
      });
    }
    next();
  };

  validarNombreParam = (solicitud: Request, respuesta: Response, next: NextFunction) => {
    const { nombre } = solicitud.params;
    if (!nombre || String(nombre).trim().length === 0) {
      return respuesta.status(400).json({
        mensaje: "El nombre de la región es necesario en la URL."
      });
    }
    next();
  };
}

export default new RegionValidador();
