import React, { useState } from 'react';
import { Search, Sparkles, MapPin, Building, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const QUICK_COUNTRIES = [
  'Colombia',
  'Argentina',
  'España',
  'Francia',
  'Alemania',
  'Japón',
  'México',
  'Brasil',
  'Canadá',
  'Italia',
  'Perú',
  'Chile'
];

export const CapitalFinder: React.FC = () => {
  const [countryName, setCountryName] = useState('Colombia');
  const [result, setResult] = useState<{ ciudad: string; estado: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedName, setSearchedName] = useState('');

  const handleSearch = async (nameToSearch?: string) => {
    const target = (nameToSearch || countryName).trim();
    if (!target) return;

    setIsLoading(true);
    setError(null);
    setSearchedName(target);

    try {
      const res = await fetch(`/api/paises/capital/${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.mensaje || `No se encontró información de capital para "${target}".`);
        setResult(null);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(`Error de conexión: ${e.message}`);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Hero Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Agregación de Capitales MongoDB</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Consultar Capital por País
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Endpoint especializado: <code className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-mono">GET /api/paises/capital/:pais</code>.
            Filtra y extrae la ciudad con <span className="font-mono text-xs">capitalPais: true</span>.
          </p>
        </div>

        {/* Input bar */}
        <div className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-capital-country"
              type="text"
              value={countryName}
              onChange={e => setCountryName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Escribe el nombre del país..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <button
            id="btn-search-capital"
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Buscar</span>
          </button>
        </div>

        {/* Quick pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-xs text-slate-400 mr-1">Pruebas rápidas:</span>
          {QUICK_COUNTRIES.map(p => (
            <button
              key={p}
              onClick={() => {
                setCountryName(p);
                handleSearch(p);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Result Presentation Card */}
      {result && (
        <div className="bg-gradient-to-br from-white to-sky-50/50 rounded-2xl p-6 sm:p-8 border border-sky-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-900">
                Capital Localizada
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              País: <strong>{searchedName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-sky-100 shadow-2xs space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-sky-600" />
                Ciudad Capital:
              </span>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {result.ciudad}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-sky-100 shadow-2xs space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Región / Estado / Departamento:
              </span>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">
                {result.estado || 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-5 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold">{error}</p>
            <p className="text-rose-600 mt-0.5">
              Verifica la ortografía o consulta la lista de países disponibles en el Explorador.
            </p>
          </div>
        </div>
      )}

      {/* Aggregation Pipeline Explanation */}
      <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Detalle Técnico: Pipeline de Agregación MongoDB
        </h3>
        <p className="text-xs text-slate-400">
          El endpoint original ejecuta la siguiente secuencia de etapas sobre la colección <code className="text-sky-400">paises</code>:
        </p>
        <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`[
  { $match: { nombre: "${searchedName || countryName}" } },
  { $unwind: "$regiones" },
  { $unwind: "$regiones.ciudades" },
  { $match: { "regiones.ciudades.capitalPais": true } },
  {
    $project: {
      _id: 0,
      ciudad: "$regiones.ciudades.nombre",
      estado: "$regiones.nombre"
    }
  }
]`}
        </pre>
      </div>
    </div>
  );
};
