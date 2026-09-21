export interface Ciudad {
  codigo?: string;
  nombre: string;
  habitantes?: number;
  esCapital?: boolean;
  capitalRegion?: boolean;
  capitalPais?: boolean;
}

export interface Region {
  codigo?: string;
  nombre: string;
  area: number;
  poblacion: number;
  ciudades?: Ciudad[];
}

export interface Pais {
  id: number;
  nombre: string;
  continente: string;
  tipoRegion: string;
  codigoAlfa2: string;
  codigoAlfa3: string;
  regiones?: Region[];
}
