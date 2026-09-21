import bd from './bd.ts';
import type { Ciudad } from '../types.ts';

class CiudadRepositorio {
  private collectionName = 'paises';

  get _collection() {
    return bd.obtenerBD().collection(this.collectionName);
  }

  async listar(idPais: number, nombreRegion: string): Promise<Ciudad[]> {
    try {
      const pipeline = [
        { $match: { id: idPais } },
        { $unwind: "$regiones" },
        { $match: { "regiones.nombre": nombreRegion } },
        { $project: { _id: 0, ciudades: "$regiones.ciudades" } }
      ];

      const resultado = await this._collection.aggregate(pipeline).toArray() as unknown as Array<{ ciudades?: Ciudad[] }>;
      return resultado.length > 0 ? (resultado[0].ciudades || []) : [];
    } catch (error) {
      this._handleError('listar', error);
      throw error;
    }
  }

  async agregar(idPais: number, nombreRegion: string, ciudad: Ciudad): Promise<Ciudad> {
    try {
      const resultado = await this._collection.updateOne(
        { id: idPais, "regiones.nombre": nombreRegion },
        {
          $push: { "regiones.$.ciudades": ciudad }
        }
      );

      if (resultado.matchedCount === 0) throw new Error('País o Región no encontrada');
      return ciudad;
    } catch (error) {
      this._handleError('agregar', error);
      throw error;
    }
  }

  async modificar(idPais: number, nombreRegion: string, ciudad: Ciudad): Promise<Ciudad> {
    try {
      const resultado = await this._collection.updateOne(
        { id: idPais },
        {
          $set: {
            "regiones.$[reg].ciudades.$[ciu].habitantes": ciudad.habitantes,
            "regiones.$[reg].ciudades.$[ciu].esCapital": ciudad.esCapital
          }
        },
        {
          arrayFilters: [
            { "reg.nombre": nombreRegion },
            { "ciu.nombre": ciudad.nombre }
          ]
        }
      );

      if (resultado.matchedCount === 0) throw new Error('No se pudo actualizar la ciudad');
      return ciudad;
    } catch (error) {
      this._handleError('modificar', error);
      throw error;
    }
  }

  async eliminar(idPais: number, nombreRegion: string, nombreCiudad: string): Promise<boolean> {
    try {
      const resultado = await this._collection.updateOne(
        { id: idPais, "regiones.nombre": nombreRegion },
        {
          $pull: { "regiones.$.ciudades": { nombre: nombreCiudad } }
        }
      );

      return (resultado.modifiedCount || 0) > 0;
    } catch (error) {
      this._handleError('eliminar', error);
      throw error;
    }
  }

  private _handleError(metodo: string, error: unknown) {
    console.error(`Error en CiudadRepositorio.${metodo}:`, error);
  }
}

export default new CiudadRepositorio();
