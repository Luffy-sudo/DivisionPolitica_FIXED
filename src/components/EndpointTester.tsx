import React, { useState } from 'react';
import { Send, Terminal, Clock, CheckCircle, AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import type { ApiTestResult } from '../types';

interface PresetEndpoint {
  category: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: string;
  description: string;
}

const PRESETS: PresetEndpoint[] = [
  // Países
  {
    category: 'Países',
    name: 'Listar todos los países',
    method: 'GET',
    endpoint: '/api/paises',
    description: 'Devuelve todos los países con su id, nombre, continente, códigos alfa y tipo de región'
  },
  {
    category: 'Países',
    name: 'Obtener Capital de Colombia',
    method: 'GET',
    endpoint: '/api/paises/capital/Colombia',
    description: 'Ejecuta agregación MongoDB en memoria para localizar la ciudad marcada como capital'
  },
  {
    category: 'Países',
    name: 'Obtener Capital de Argentina',
    method: 'GET',
    endpoint: '/api/paises/capital/Argentina',
    description: 'Localiza la capital de Argentina (Buenos Aires)'
  },
  {
    category: 'Países',
    name: 'Agregar nuevo País (POST)',
    method: 'POST',
    endpoint: '/api/paises',
    body: JSON.stringify({
      id: 999,
      nombre: "Nación de Prueba",
      continente: "AMERICA",
      tipoRegion: "Provincia",
      codigoAlfa2: "NP",
      codigoAlfa3: "NPR"
    }, null, 2),
    description: 'Agrega un nuevo país al repositorio validando los campos requeridos'
  },
  {
    category: 'Países',
    name: 'Modificar País existente (PUT)',
    method: 'PUT',
    endpoint: '/api/paises',
    body: JSON.stringify({
      id: 999,
      nombre: "Nación de Prueba Modificada",
      continente: "AMERICA",
      tipoRegion: "Estado Federal",
      codigoAlfa2: "NP",
      codigoAlfa3: "NPR"
    }, null, 2),
    description: 'Actualiza los metadatos de un país por su id'
  },
  {
    category: 'Países',
    name: 'Eliminar País (DELETE)',
    method: 'DELETE',
    endpoint: '/api/paises/999',
    description: 'Elimina el país con ID 999'
  },

  // Regiones
  {
    category: 'Regiones',
    name: 'Listar regiones de Colombia (id 170)',
    method: 'GET',
    endpoint: '/api/paises/170/regiones',
    description: 'Obtiene las 33 regiones/departamentos de Colombia con área y población'
  },
  {
    category: 'Regiones',
    name: 'Agregar Región a Colombia (POST)',
    method: 'POST',
    endpoint: '/api/paises/170/regiones',
    body: JSON.stringify({
      nombre: "Región Experimental",
      area: 12500,
      poblacion: 450000
    }, null, 2),
    description: 'Agrega una región con array de ciudades vacío'
  },
  {
    category: 'Regiones',
    name: 'Modificar Región (PUT)',
    method: 'PUT',
    endpoint: '/api/paises/170/regiones',
    body: JSON.stringify({
      nombre: "Región Experimental",
      area: 15000,
      poblacion: 500000
    }, null, 2),
    description: 'Actualiza área y población de la región especificada'
  },
  {
    category: 'Regiones',
    name: 'Eliminar Región (DELETE)',
    method: 'DELETE',
    endpoint: '/api/paises/170/regiones/Región Experimental',
    description: 'Elimina la región especificada del país indicado'
  },

  // Ciudades
  {
    category: 'Ciudades',
    name: 'Listar ciudades de Antioquia (Colombia)',
    method: 'GET',
    endpoint: '/api/paises/170/regiones/Antioquia/ciudades',
    description: 'Obtiene las 126 ciudades/municipios de Antioquia'
  },
  {
    category: 'Ciudades',
    name: 'Agregar Ciudad a Antioquia (POST)',
    method: 'POST',
    endpoint: '/api/paises/170/regiones/Antioquia/ciudades',
    body: JSON.stringify({
      nombre: "Nueva Villa",
      habitantes: 35000,
      esCapital: false
    }, null, 2),
    description: 'Agrega una ciudad a la lista de ciudades de la región'
  },
  {
    category: 'Ciudades',
    name: 'Modificar Ciudad (PUT)',
    method: 'PUT',
    endpoint: '/api/paises/170/regiones/Antioquia/ciudades',
    body: JSON.stringify({
      nombre: "Nueva Villa",
      habitantes: 42000,
      esCapital: false
    }, null, 2),
    description: 'Actualiza habitantes o condición de capital usando filtros posicionales'
  },
  {
    category: 'Ciudades',
    name: 'Eliminar Ciudad (DELETE)',
    method: 'DELETE',
    endpoint: '/api/paises/170/regiones/Antioquia/ciudades/Nueva Villa',
    description: 'Elimina la ciudad especificada de la región'
  }
];

interface EndpointTesterProps {
  onMutated?: () => void;
}

export const EndpointTester: React.FC<EndpointTesterProps> = ({ onMutated }) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetEndpoint>(PRESETS[0]);
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState<string>('/api/paises');
  const [requestBody, setRequestBody] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<ApiTestResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ApiTestResult | null>(null);
  const [copied, setCopied] = useState(false);

  const applyPreset = (preset: PresetEndpoint) => {
    setSelectedPreset(preset);
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    setRequestBody(preset.body || '');
  };

  const handleExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsExecuting(true);

    const start = performance.now();
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (['POST', 'PUT'].includes(method) && requestBody.trim()) {
        try {
          JSON.parse(requestBody);
          options.body = requestBody;
        } catch (jsonErr) {
          alert('El cuerpo de la petición contiene JSON inválido. Por favor corrígelo antes de enviar.');
          setIsExecuting(false);
          return;
        }
      }

      const res = await fetch(endpoint, options);
      const durationMs = Math.round(performance.now() - start);

      let data: unknown;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const result: ApiTestResult = {
        method,
        endpoint,
        status: res.status,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
        requestBody: ['POST', 'PUT'].includes(method) ? requestBody : undefined,
        response: data
      };

      setCurrentResult(result);
      setHistory(prev => [result, ...prev.slice(0, 9)]);

      if (['POST', 'PUT', 'DELETE'].includes(method) && onMutated) {
        onMutated();
      }
    } catch (err: unknown) {
      const error = err as Error;
      const durationMs = Math.round(performance.now() - start);
      const errResult: ApiTestResult = {
        method,
        endpoint,
        status: 0,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
        response: { error: error.message || 'Fallo de conexión con el endpoint' }
      };
      setCurrentResult(errResult);
      setHistory(prev => [errResult, ...prev.slice(0, 9)]);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyResponse = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(JSON.stringify(currentResult.response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category selector & Preset Pills */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Plantillas de Endpoints Predefinidos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecciona un caso de prueba para rellenar automáticamente método, ruta y payload:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESETS.map((preset, idx) => {
            const isCurrent = selectedPreset.name === preset.name;
            const methodColors = {
              GET: 'text-emerald-700 bg-emerald-50 border-emerald-200',
              POST: 'text-sky-700 bg-sky-50 border-sky-200',
              PUT: 'text-amber-700 bg-amber-50 border-amber-200',
              DELETE: 'text-rose-700 bg-rose-50 border-rose-200'
            };

            return (
              <button
                key={idx}
                id={`preset-btn-${idx}`}
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/10'
                    : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${methodColors[preset.method]}`}>
                    {preset.method}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {preset.name}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 truncate">
                  {preset.endpoint}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Request & Response Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-600" />
              Editor de Petición HTTP
            </h3>
            <span className="text-xs text-slate-500">
              {selectedPreset.description}
            </span>
          </div>

          <form onSubmit={handleExecute} className="space-y-4">
            {/* Method + Endpoint Input */}
            <div className="flex gap-2">
              <select
                id="select-http-method"
                value={method}
                onChange={e => setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}
                className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                id="input-endpoint-url"
                type="text"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                placeholder="/api/paises"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {/* Request Body (for POST/PUT) */}
            {['POST', 'PUT'].includes(method) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">Cuerpo de la Solicitud (JSON):</span>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(requestBody);
                        setRequestBody(JSON.stringify(parsed, null, 2));
                      } catch (e) {
                        alert('JSON inválido');
                      }
                    }}
                    className="text-sky-600 hover:text-sky-700 underline text-[11px]"
                  >
                    Formatear JSON
                  </button>
                </div>
                <textarea
                  id="textarea-request-body"
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  placeholder='{ "campo": "valor" }'
                />
              </div>
            )}

            {/* Execute Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="btn-send-request"
                type="submit"
                disabled={isExecuting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm shadow-sm shadow-sky-600/20 transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Ejecutando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Petición</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* History list */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Historial de ejecuciones recientes
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentResult(h)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`font-mono font-bold text-[10px] px-1 rounded ${
                        h.status >= 200 && h.status < 300
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {h.status || 'ERR'}
                      </span>
                      <span className="font-mono text-slate-700 truncate">{h.method} {h.endpoint}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] shrink-0">{h.durationMs}ms</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Response Output */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Respuesta del Servidor
              </h3>
              {currentResult && (
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                      currentResult.status >= 200 && currentResult.status < 300
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {currentResult.status >= 200 && currentResult.status < 300 ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    HTTP {currentResult.status}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    {currentResult.durationMs}ms
                  </span>
                </div>
              )}
            </div>

            {currentResult && (
              <button
                onClick={copyResponse}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Copiar JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 mt-3 overflow-hidden rounded-xl bg-slate-950 border border-slate-900 p-4">
            {currentResult ? (
              <pre className="text-xs font-mono text-emerald-400 h-full overflow-y-auto whitespace-pre-wrap break-all selection:bg-emerald-900 selection:text-white">
                {typeof currentResult.response === 'object'
                  ? JSON.stringify(currentResult.response, null, 2)
                  : String(currentResult.response)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                <Terminal className="w-8 h-8 mb-2 stroke-1 text-slate-700" />
                <span>Presiona "Enviar Petición" para ver la respuesta aquí.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
