import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, Globe, ChevronRight, Shield, Users, Maximize2, Loader2, Sparkles } from 'lucide-react';
import type { Pais, Region, Ciudad } from '../types';

interface CountryExplorerProps {
  countries: Pais[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const CountryExplorer: React.FC<CountryExplorerProps> = ({ countries, isLoading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('TODOS');
  const [selectedCountry, setSelectedCountry] = useState<Pais | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [cities, setCities] = useState<Ciudad[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [capitalInfo, setCapitalInfo] = useState<{ ciudad: string; estado: string } | null>(null);
  const [isLoadingCapital, setIsLoadingCapital] = useState(false);

  // Extract unique continents
  const continents = ['TODOS', ...Array.from(new Set(countries.map(c => c.continente).filter(Boolean)))];

  // Filter countries
  const filteredCountries = countries.filter(country => {
    const matchesSearch =
      country.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.codigoAlfa2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.codigoAlfa3?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContinent = selectedContinent === 'TODOS' || country.continente === selectedContinent;
    return matchesSearch && matchesContinent;
  });

  // Load regions when country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setRegions([]);
      setSelectedRegion(null);
      setCities([]);
      setCapitalInfo(null);
      return;
    }

    const fetchRegionsAndCapital = async () => {
      setIsLoadingRegions(true);
      setIsLoadingCapital(true);
      setSelectedRegion(null);
      setCities([]);

      try {
        const [regRes, capRes] = await Promise.all([
          fetch(`/api/paises/${selectedCountry.id}/regiones`),
          fetch(`/api/paises/capital/${encodeURIComponent(selectedCountry.nombre)}`)
        ]);

        if (regRes.ok) {
          const regData = await regRes.json();
          setRegions(regData || []);
        } else {
          setRegions([]);
        }

        if (capRes.ok) {
          const capData = await capRes.json();
          setCapitalInfo(capData);
        } else {
          setCapitalInfo(null);
        }
      } catch (err) {
        console.error('Error fetching country details:', err);
      } finally {
        setIsLoadingRegions(false);
        setIsLoadingCapital(false);
      }
    };

    fetchRegionsAndCapital();
  }, [selectedCountry]);

  // Load cities when region is selected
  useEffect(() => {
    if (!selectedCountry || !selectedRegion) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch(`/api/paises/${selectedCountry.id}/regiones/${encodeURIComponent(selectedRegion.nombre)}/ciudades`);
        if (res.ok) {
          const data = await res.json();
          setCities(data || []);
        } else {
          setCities([]);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedCountry, selectedRegion]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-countries"
              type="text"
              placeholder="Buscar por nombre, código alfa-2 (CO, AR, US) o alfa-3..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Continents filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {continents.map(c => (
              <button
                key={c}
                onClick={() => setSelectedContinent(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedContinent === c
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Column Hierarchy View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Countries List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[640px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-600" />
              <h2 className="font-semibold text-sm text-slate-800">
                Países ({filteredCountries.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              API: <code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded">GET /api/paises</code>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                <span className="text-xs">Cargando países desde la API...</span>
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se encontraron países con el filtro actual.
              </div>
            ) : (
              filteredCountries.map(country => {
                const isSelected = selectedCountry?.id === country.id;
                return (
                  <button
                    key={country.id}
                    id={`country-item-${country.id}`}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full text-left p-3.5 transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-sky-50/80 border-l-4 border-sky-600'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900 truncate">
                          {country.nombre}
                        </span>
                        {country.codigoAlfa2 && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {country.codigoAlfa2}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span>{country.continente}</span>
                        {country.tipoRegion && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{country.tipoRegion}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-sky-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Selected Country Details & Regions List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[640px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h2 className="font-semibold text-sm text-slate-800">
                {selectedCountry ? `${selectedCountry.tipoRegion || 'Regiones'} de ${selectedCountry.nombre}` : 'Regiones'}
              </h2>
            </div>
            {selectedCountry && (
              <span className="text-xs text-slate-500">
                <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">
                  /api/paises/{selectedCountry.id}/regiones
                </code>
              </span>
            )}
          </div>

          {selectedCountry ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Country summary header card */}
              <div className="p-4 bg-slate-50/60 border-b border-slate-100 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedCountry.nombre}</h3>
                    <p className="text-xs text-slate-500">{selectedCountry.continente} • ID #{selectedCountry.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {selectedCountry.codigoAlfa2} / {selectedCountry.codigoAlfa3}
                    </span>
                  </div>
                </div>

                {/* Capital pill */}
                <div className="mt-2 p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-slate-500">Capital oficial:</span>
                  </div>
                  {isLoadingCapital ? (
                    <span className="text-xs text-slate-400">Consultando capital...</span>
                  ) : capitalInfo ? (
                    <span className="text-xs font-semibold text-slate-800">
                      {capitalInfo.ciudad} <span className="text-slate-400 font-normal">({capitalInfo.estado})</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No registrada</span>
                  )}
                </div>
              </div>

              {/* Regions listing */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {isLoadingRegions ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="text-xs">Consultando regiones en la API...</span>
                  </div>
                ) : regions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Este país no tiene regiones registradas en la base de datos actualmente.
                  </div>
                ) : (
                  regions.map((region, idx) => {
                    const isSelected = selectedRegion?.nombre === region.nombre;
                    return (
                      <button
                        key={idx}
                        id={`region-item-${region.nombre}`}
                        onClick={() => setSelectedRegion(region)}
                        className={`w-full text-left p-3.5 transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="font-medium text-sm text-slate-900 block truncate">
                            {region.nombre}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            {region.area > 0 && (
                              <span className="flex items-center gap-1">
                                <Maximize2 className="w-3 h-3 text-slate-400" />
                                {Number(region.area).toLocaleString()} km²
                              </span>
                            )}
                            {region.poblacion > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                {Number(region.poblacion).toLocaleString()} hab.
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full gap-2">
              <MapPin className="w-8 h-8 text-slate-300 stroke-1" />
              <p className="text-xs text-slate-500 font-medium">Selecciona un país de la lista</p>
              <p className="text-[11px] text-slate-400 max-w-[200px]">
                Haz clic en cualquier país para ver sus subdivisiones políticas y capital.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Cities List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[640px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h2 className="font-semibold text-sm text-slate-800">
                {selectedRegion ? `Ciudades de ${selectedRegion.nombre}` : 'Ciudades'}
              </h2>
            </div>
            {selectedCountry && selectedRegion && (
              <span className="text-xs text-slate-500">
                <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                  .../{selectedRegion.nombre}/ciudades
                </code>
              </span>
            )}
          </div>

          {selectedRegion ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Region summary */}
              <div className="p-4 bg-slate-50/60 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedRegion.nombre}</h3>
                    <p className="text-xs text-slate-500">{selectedCountry?.nombre}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{Number(selectedRegion.area).toLocaleString()} km²</p>
                    <p>{Number(selectedRegion.poblacion).toLocaleString()} hab.</p>
                  </div>
                </div>
              </div>

              {/* Cities listing */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {isLoadingCities ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span className="text-xs">Consultando ciudades en la API...</span>
                  </div>
                ) : cities.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No hay ciudades registradas para esta región.
                  </div>
                ) : (
                  cities.map((city, idx) => (
                    <div
                      key={idx}
                      id={`city-item-${idx}`}
                      className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-slate-900 truncate">
                            {city.nombre}
                          </span>
                          {city.capitalPais && (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Capital del País
                            </span>
                          )}
                          {city.capitalRegion && !city.capitalPais && (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Capital Regional
                            </span>
                          )}
                        </div>
                        {city.codigo && (
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            Cód: {city.codigo}
                          </p>
                        )}
                      </div>
                      {city.habitantes !== undefined && city.habitantes > 0 && (
                        <span className="text-xs text-slate-500 font-mono shrink-0">
                          {Number(city.habitantes).toLocaleString()} hab.
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full gap-2">
              <Building2 className="w-8 h-8 text-slate-300 stroke-1" />
              <p className="text-xs text-slate-500 font-medium">Selecciona una región</p>
              <p className="text-[11px] text-slate-400 max-w-[200px]">
                Haz clic en una región en la columna central para desplegar sus ciudades o municipios.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
