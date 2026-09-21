import fs from 'fs';
import path from 'path';
import { configBD } from '../configuracion/bd.config.ts';
import type { Pais, Region, Ciudad } from '../types.ts';

// Helper to deep clone
function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class InMemoryCollection {
  private data: Pais[] = [];
  private initialData: Pais[] = [];

  constructor() {
    this.cargarDatosIniciales();
  }

  public cargarDatosIniciales() {
    try {
      const dataPath = path.join(process.cwd(), 'server', 'data', 'countries.json');
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        this.initialData = JSON.parse(raw);
        this.data = clone(this.initialData);
        console.log(`[InMemoryCollection] Cargados ${this.data.length} países iniciales.`);
      } else {
        console.warn(`[InMemoryCollection] No se encontró ${dataPath}, inicializando vacío.`);
        this.data = [];
      }
    } catch (err) {
      console.error('[InMemoryCollection] Error al cargar países:', err);
      this.data = [];
    }
  }

  public reiniciar(): void {
    this.data = clone(this.initialData);
  }

  public getRawData(): Pais[] {
    return this.data;
  }

  find(filter: Record<string, unknown> = {}) {
    let result = clone(this.data);
    if (filter && Object.keys(filter).length > 0) {
      result = result.filter(item => {
        return Object.entries(filter).every(([k, v]) => (item as unknown as Record<string, unknown>)[k] === v);
      });
    }

    return {
      project: (projection: Record<string, number>) => ({
        toArray: async () => {
          return result.map(item => {
            const projected: Record<string, unknown> = {};
            for (const key of Object.keys(projection)) {
              if (projection[key] === 1) {
                projected[key] = (item as unknown as Record<string, unknown>)[key];
              }
            }
            return projected;
          });
        }
      }),
      toArray: async () => result
    };
  }

  async insertOne(doc: Pais) {
    const nuevo = clone(doc);
    if (!nuevo.id) {
      const maxId = this.data.reduce((max, p) => Math.max(max, p.id || 0), 0);
      nuevo.id = maxId + 1;
    }
    nuevo.regiones = nuevo.regiones || [];
    this.data.push(nuevo);
    return { acknowledged: true, insertedId: nuevo.id };
  }

  async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>, options?: { arrayFilters?: Array<Record<string, unknown>> }) {
    // 1. Filter by country id
    let countryIndex = -1;
    if (filter.id !== undefined) {
      const targetId = Number(filter.id);
      countryIndex = this.data.findIndex(p => Number(p.id) === targetId);
    }

    if (countryIndex === -1) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    const country = this.data[countryIndex];
    let modified = false;

    // $set operations
    if (update.$set) {
      const setOps = update.$set as Record<string, unknown>;

      // Check if setting top-level country fields
      if (setOps.nombre !== undefined || setOps.continente !== undefined || setOps.tipoRegion !== undefined || setOps.codigoAlfa2 !== undefined || setOps.codigoAlfa3 !== undefined) {
        Object.assign(country, {
          ...(setOps.nombre !== undefined ? { nombre: setOps.nombre } : {}),
          ...(setOps.continente !== undefined ? { continente: setOps.continente } : {}),
          ...(setOps.tipoRegion !== undefined ? { tipoRegion: setOps.tipoRegion } : {}),
          ...(setOps.codigoAlfa2 !== undefined ? { codigoAlfa2: setOps.codigoAlfa2 } : {}),
          ...(setOps.codigoAlfa3 !== undefined ? { codigoAlfa3: setOps.codigoAlfa3 } : {})
        });
        modified = true;
      }

      // Check for 'regiones.$.area' and 'regiones.$.poblacion'
      if (setOps['regiones.$.area'] !== undefined || setOps['regiones.$.poblacion'] !== undefined) {
        const regionNombreFilter = (filter['regiones.nombre'] as string)?.toLowerCase();
        const region = (country.regiones || []).find(r => r.nombre.toLowerCase() === regionNombreFilter);
        if (region) {
          if (setOps['regiones.$.area'] !== undefined) region.area = Number(setOps['regiones.$.area']);
          if (setOps['regiones.$.poblacion'] !== undefined) region.poblacion = Number(setOps['regiones.$.poblacion']);
          modified = true;
        } else {
          return { matchedCount: 0, modifiedCount: 0 };
        }
      }

      // Check for arrayFilters (city update: "regiones.$[reg].ciudades.$[ciu].habitantes")
      if (options?.arrayFilters && options.arrayFilters.length >= 2) {
        const regFilter = options.arrayFilters.find(f => f['reg.nombre'] !== undefined);
        const ciuFilter = options.arrayFilters.find(f => f['ciu.nombre'] !== undefined);
        if (regFilter && ciuFilter) {
          const regNombre = String(regFilter['reg.nombre']).toLowerCase();
          const ciuNombre = String(ciuFilter['ciu.nombre']).toLowerCase();

          const region = (country.regiones || []).find(r => r.nombre.toLowerCase() === regNombre);
          if (region && region.ciudades) {
            const ciudad = region.ciudades.find(c => c.nombre.toLowerCase() === ciuNombre);
            if (ciudad) {
              const habKey = 'regiones.$[reg].ciudades.$[ciu].habitantes';
              const capKey = 'regiones.$[reg].ciudades.$[ciu].esCapital';
              if (setOps[habKey] !== undefined) ciudad.habitantes = Number(setOps[habKey]);
              if (setOps[capKey] !== undefined) ciudad.esCapital = Boolean(setOps[capKey]);
              modified = true;
            } else {
              return { matchedCount: 0, modifiedCount: 0 };
            }
          } else {
            return { matchedCount: 0, modifiedCount: 0 };
          }
        }
      }
    }

    // $push operations
    if (update.$push) {
      const pushOps = update.$push as Record<string, unknown>;

      // push region
      if (pushOps.regiones) {
        country.regiones = country.regiones || [];
        const newRegion = clone(pushOps.regiones as Region);
        newRegion.ciudades = newRegion.ciudades || [];
        country.regiones.push(newRegion);
        modified = true;
      }

      // push ciudad: "regiones.$.ciudades"
      if (pushOps['regiones.$.ciudades']) {
        const regionNombreFilter = (filter['regiones.nombre'] as string)?.toLowerCase();
        const region = (country.regiones || []).find(r => r.nombre.toLowerCase() === regionNombreFilter);
        if (region) {
          region.ciudades = region.ciudades || [];
          region.ciudades.push(clone(pushOps['regiones.$.ciudades'] as Ciudad));
          modified = true;
        } else {
          return { matchedCount: 0, modifiedCount: 0 };
        }
      }
    }

    // $pull operations
    if (update.$pull) {
      const pullOps = update.$pull as Record<string, unknown>;

      // pull region: { regiones: { nombre: nombreRegion } }
      if (pullOps.regiones) {
        const targetNombre = ((pullOps.regiones as { nombre: string }).nombre || '').toLowerCase();
        const beforeLen = (country.regiones || []).length;
        country.regiones = (country.regiones || []).filter(r => r.nombre.toLowerCase() !== targetNombre);
        if (country.regiones.length < beforeLen) {
          modified = true;
        }
      }

      // pull ciudad: { "regiones.$.ciudades": { nombre: nombreCiudad } }
      if (pullOps['regiones.$.ciudades']) {
        const regionNombreFilter = (filter['regiones.nombre'] as string)?.toLowerCase();
        const region = (country.regiones || []).find(r => r.nombre.toLowerCase() === regionNombreFilter);
        if (region && region.ciudades) {
          const targetCiudad = ((pullOps['regiones.$.ciudades'] as { nombre: string }).nombre || '').toLowerCase();
          const beforeLen = region.ciudades.length;
          region.ciudades = region.ciudades.filter(c => c.nombre.toLowerCase() !== targetCiudad);
          if (region.ciudades.length < beforeLen) {
            modified = true;
          }
        }
      }
    }

    return { matchedCount: 1, modifiedCount: modified ? 1 : 0 };
  }

  async deleteOne(filter: Record<string, unknown>) {
    if (filter.id !== undefined) {
      const targetId = Number(filter.id);
      const beforeLen = this.data.length;
      this.data = this.data.filter(p => Number(p.id) !== targetId);
      return { deletedCount: this.data.length < beforeLen ? 1 : 0 };
    }
    return { deletedCount: 0 };
  }

  aggregate(pipeline: Array<Record<string, unknown>>) {
    return {
      toArray: async () => {
        let currentDocs: unknown[] = clone(this.data);

        for (const stage of pipeline) {
          if (stage.$match) {
            const matchCriteria = stage.$match as Record<string, unknown>;
            currentDocs = currentDocs.filter(doc => {
              const d = doc as Record<string, unknown>;
              for (const [key, val] of Object.entries(matchCriteria)) {
                if (key.includes('.')) {
                  // Nested property check like "regiones.nombre" or "regiones.ciudades.capitalPais"
                  const parts = key.split('.');
                  let cur: unknown = d;
                  for (const part of parts) {
                    if (cur && typeof cur === 'object') {
                      cur = (cur as Record<string, unknown>)[part];
                    } else {
                      cur = undefined;
                      break;
                    }
                  }
                  if (typeof val === 'string' && typeof cur === 'string') {
                    if (cur.toLowerCase() !== val.toLowerCase()) return false;
                  } else if (cur !== val) {
                    return false;
                  }
                } else {
                  if (typeof val === 'string' && typeof d[key] === 'string') {
                    if ((d[key] as string).toLowerCase() !== val.toLowerCase()) return false;
                  } else if (Number(d[key]) !== Number(val) && d[key] !== val) {
                    return false;
                  }
                }
              }
              return true;
            });
          }

          if (stage.$unwind) {
            const unwindPath = (stage.$unwind as string).replace('$', '');
            const newDocs: unknown[] = [];
            for (const doc of currentDocs) {
              const d = doc as Record<string, unknown>;
              const parts = unwindPath.split('.');
              if (parts.length === 1) {
                const arr = d[parts[0]];
                if (Array.isArray(arr)) {
                  for (const item of arr) {
                    newDocs.push({ ...d, [parts[0]]: item });
                  }
                }
              } else if (parts.length === 2) {
                const parent = d[parts[0]] as Record<string, unknown>;
                if (parent && Array.isArray(parent[parts[1]])) {
                  for (const item of (parent[parts[1]] as unknown[])) {
                    newDocs.push({
                      ...d,
                      [parts[0]]: {
                        ...parent,
                        [parts[1]]: item
                      }
                    });
                  }
                }
              }
            }
            currentDocs = newDocs;
          }

          if (stage.$project) {
            const projectSpec = stage.$project as Record<string, unknown>;
            currentDocs = currentDocs.map(doc => {
              const d = doc as Record<string, unknown>;
              const res: Record<string, unknown> = {};
              for (const [outKey, inSpec] of Object.entries(projectSpec)) {
                if (outKey === '_id') continue;
                if (inSpec === 1) {
                  // Field name like 'regiones.nombre'
                  if (outKey.includes('.')) {
                    // e.g. 'regiones.nombre': 1
                    // For region listing pipeline:
                    // pipeline = [ { $match: { id } }, { $project: { 'regiones.nombre': 1, 'regiones.area': 1, 'regiones.poblacion': 1 } } ]
                    // In MongoDB, projecting subfields of an array returns the array with only those fields.
                    const [arrName, field] = outKey.split('.');
                    if (!res[arrName]) {
                      const origArr = d[arrName] as Array<Record<string, unknown>>;
                      if (Array.isArray(origArr)) {
                        res[arrName] = origArr.map(item => ({
                          nombre: item.nombre,
                          area: item.area,
                          poblacion: item.poblacion
                        }));
                      } else {
                        res[arrName] = [];
                      }
                    }
                  } else {
                    res[outKey] = d[outKey];
                  }
                } else if (typeof inSpec === 'string' && inSpec.startsWith('$')) {
                  const exprPath = inSpec.slice(1).split('.');
                  let cur: any = d;
                  for (const p of exprPath) {
                    if (cur && typeof cur === 'object') {
                      cur = cur[p];
                    } else {
                      cur = undefined;
                      break;
                    }
                  }
                  res[outKey] = cur;
                }
              }
              return res;
            });
          }
        }

        return currentDocs;
      }
    };
  }
}

class ConexionBD {
  private url: string;
  private nombreBD: string;
  private inMemoryDb: { collection: (name: string) => InMemoryCollection };
  private activeCollection: InMemoryCollection;

  constructor() {
    this.url = configBD.url;
    this.nombreBD = configBD.BASEDATOS;
    this.activeCollection = new InMemoryCollection();
    this.inMemoryDb = {
      collection: (name: string) => {
        return this.activeCollection;
      }
    };
  }

  async conectar() {
    console.log(`[ConexionBD] Iniciando servicio de datos para: ${this.nombreBD}`);
    console.log(`[ConexionBD] Base de datos en memoria inicializada y lista.`);
    return this.inMemoryDb;
  }

  obtenerBD() {
    return this.inMemoryDb;
  }

  reiniciarDatos() {
    this.activeCollection.reiniciar();
    console.log('[ConexionBD] Datos restablecidos a los valores originales del seed.');
  }

  async cerrar() {
    console.log('🔌 Conexión a Base de Datos cerrada.');
  }
}

export default new ConexionBD();
