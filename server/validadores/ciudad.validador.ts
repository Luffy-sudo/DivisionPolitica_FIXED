import type { Request, Response, NextFunction } from 'express';

class CiudadValidador {
  validarCuerpo = (solicitud: Request, respuesta: Response, next: NextFunction) => {
    const { nombre, habitantes, esCapital } = solicitud.body;
    const errores: string[] = [];

    if (!nombre || String(nombre).trim().length < 2) {
      errores.push("El 'nombre' de la ciudad es obligatorio y debe tener al menos 2 caracteres.");
    }

    if (habitantes === undefined || isNaN(Number(habitantes)) || Number(habitantes) < 0) {
      errores.push("El campo 'habitantes' es obligatorio y debe ser un número positivo.");
    }

    if (esCapital === undefined || typeof esCapital !== 'boolean') {
      errores.push("El campo 'esCapital' es obligatorio y debe ser un valor booleano (true/false).");
    }

    if (errores.length > 0) {
      return respuesta.status(400).json({
        mensaje: "Error de validación en la ciudad",
        detalles: errores
      });
    }

    next();
  };

  validarParams = (solicitud: Request, respuesta: Response, next: NextFunction) => {
    const id = parseInt(solicitud.params.id);
    const { region } = solicitud.params;

    if (isNaN(id)) {
      return respuesta.status(400).json({ mensaje: "El ID del país debe ser un número válido." });
    }

    if (!region || String(region).trim().length === 0) {
      return respuesta.status(400).json({ mensaje: "El nombre de la región es obligatorio en la URL." });
    }

    next();
  };
}

export default new CiudadValidador();
