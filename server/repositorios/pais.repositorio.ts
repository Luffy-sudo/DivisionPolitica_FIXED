import bd from './bd.ts';
import type { Pais } from '../types.ts';

class PaisRepositorio {
  private collectionName = 'paises';

  get _collection() {
    const basedatos = bd.obtenerBD();
    return basedatos.collection(this.collectionName);
  }

  async listar(): Promise<Partial<Pais>[]> {
    try {
      return await this._collection
        .find()
        .project({
          id: 1,
          nombre: 1,
          continente: 1,
          tipoRegion: 1,
          codigoAlfa2: 1,
          codigoAlfa3: 1
        })
        .toArray() as Partial<Pais>[];
    } catch (error) {
      this._handleError('listar', error);
      throw error;
    }
  }

  async agregar(pais: Pais): Promise<Pais> {
    try {
      await this._collection.insertOne({
        id: Number(pais.id),
        nombre: pais.nombre,
        tipoRegion: pais.tipoRegion,
        continente: pais.continente,
        codigoAlfa2: pais.codigoAlfa2,
        codigoAlfa3: pais.codigoAlfa3,
        regiones: pais.regiones || []
      });
      return pais;
    } catch (error) {
      this._handleError('agregar', error);
      throw error;
    }
  }

  async modificar(pais: Partial<Pais> & { id: number | string }): Promise<Partial<Pais>> {
    try {
      const filtro = { id: Number(pais.id) };
      const resultado = await this._collection.updateOne(
        filtro,
        { $set: { ...pais } }
      );
      if (resultado.matchedCount === 0) throw new Error('País no encontrado');
      return pais;
    } catch (error) {
      this._handleError('modificar', error);
      throw error;
    }
  }

  async eliminar(idPais: string | number): Promise<boolean> {
    try {
      const resultado = await this._collection.deleteOne({ id: parseInt(String(idPais)) });
      return (resultado.deletedCount || 0) > 0;
    } catch (error) {
      this._handleError('eliminar', error);
      throw error;
    }
  }

  async obtenerCapital(nombrePais: string): Promise<{ ciudad: string; estado: string } | null> {
    try {
      const pipeline = [
        { $match: { nombre: nombrePais } },
        { $unwind: '$regiones' },
        { $unwind: '$regiones.ciudades' },
        { $match: { "regiones.ciudades.capitalPais": true } },
        {
          $project: {
            _id: 0,
            ciudad: '$regiones.ciudades.nombre',
            estado: '$regiones.nombre'
          }
        }
      ];
      const resultado = await this._collection.aggregate(pipeline).toArray() as unknown as Array<{ ciudad: string; estado: string }>;
      return resultado[0] || null;
    } catch (error) {
      this._handleError('obtenerCapital', error);
      throw error;
    }
  }

  private _handleError(metodo: string, error: unknown) {
    console.error(`Error en PaisRepositorio.${metodo}:`, error);
  }
}

export default new PaisRepositorio();
