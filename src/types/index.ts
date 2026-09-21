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

export interface ApiTestResult {
  method: string;
  endpoint: string;
  status: number;
  durationMs: number;
  timestamp: string;
  requestBody?: string;
  response: unknown;
}
