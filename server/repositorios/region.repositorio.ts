import bd from './bd.ts';
import type { Region } from '../types.ts';

class RegionRepositorio {
  private collectionName = 'paises';

  get _collection() {
    return bd.obtenerBD().collection(this.collectionName);
  }

  async listar(idPais: string | number): Promise<Region[]> {
    try {
      const pipeline = [
        { $match: { id: parseInt(String(idPais)) } },
        {
          $project: {
            _id: 0,
            'regiones.nombre': 1,
            'regiones.area': 1,
            'regiones.poblacion': 1,
          }
        }
      ];
      const resultado = await this._collection.aggregate(pipeline).toArray() as unknown as Array<{ regiones?: Region[] }>;
      return resultado.length > 0 ? (resultado[0].regiones || []) : [];
    } catch (error) {
      this._handleError('listar', error);
      throw error;
    }
  }

  async agregar(idPais: string | number, region: Region): Promise<Region> {
    try {
      const resultado = await this._collection.updateOne(
        { id: parseInt(String(idPais)) },
        {
          $push: {
            regiones: {
              ...region,
              ciudades: []
            }
          }
        }
      );

      if (resultado.matchedCount === 0) throw new Error('El país no existe');
      return region;
    } catch (error) {
      this._handleError('agregar', error);
      throw error;
    }
  }

  async modificar(idPais: string | number, region: Region): Promise<Region> {
    try {
      const resultado = await this._collection.updateOne(
        {
          id: parseInt(String(idPais)),
          "regiones.nombre": region.nombre
        },
        {
          $set: {
            'regiones.$.area': region.area,
            'regiones.$.poblacion': region.poblacion,
          }
        }
      );
      if (resultado.matchedCount === 0) throw new Error('No se encontró la región para modificar');
      return region;
    } catch (error) {
      this._handleError('modificar', error);
      throw error;
    }
  }

  async eliminar(idPais: string | number, nombreRegion: string): Promise<boolean> {
    try {
      const resultado = await this._collection.updateOne(
        { id: parseInt(String(idPais)) },
        {
          $pull: {
            regiones: { nombre: nombreRegion }
          }
        }
      );
      return (resultado.modifiedCount || 0) > 0;
    } catch (error) {
      this._handleError('eliminar', error);
      throw error;
    }
  }

  private _handleError(metodo: string, error: unknown) {
    console.error(`❌ Error en RegionRepositorio.${metodo}:`, error);
  }
}

export default new RegionRepositorio();
