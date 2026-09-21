import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CountryExplorer } from './components/CountryExplorer';
import { EndpointTester } from './components/EndpointTester';
import { CapitalFinder } from './components/CapitalFinder';
import { SwaggerViewer } from './components/SwaggerViewer';
import type { Pais } from './types';
import { Database, Server, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'tester' | 'capital' | 'docs'>('explorer');
  const [countries, setCountries] = useState<Pais[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchStatusAndCountries = useCallback(async () => {
    setIsLoadingCountries(true);
    try {
      // Check health
      const statusRes = await fetch('/api/estado');
      if (statusRes.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }

      // Fetch countries
      const countriesRes = await fetch('/api/paises');
      if (countriesRes.ok) {
        const data = await countriesRes.json();
        setCountries(data || []);
      }
    } catch (err) {
      console.error('Error connecting to API:', err);
      setIsOnline(false);
    } finally {
      setIsLoadingCountries(false);
    }
  }, []);

  useEffect(() => {
    fetchStatusAndCountries();
  }, [fetchStatusAndCountries]);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reiniciar-datos', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setToastMessage(data.mensaje || 'Base de datos restablecida correctamente.');
        await fetchStatusAndCountries();
      } else {
        setToastMessage('Error al restablecer los datos.');
      }
    } catch (err) {
      setToastMessage('Fallo de conexión al restablecer datos.');
    } finally {
      setIsResetting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        totalCountries={countries.length}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Microservice Status Header Banner */}
        <div className="mb-6 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Server className="w-4 h-4 text-sky-600" />
              <span>Servidor: <strong className="text-slate-800">Express + Vite</strong></span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Datos: <strong className="text-slate-800">{countries.length} Países cargados</strong></span>
            </div>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Swagger: <strong className="text-slate-800">OpenAPI 3.0</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Puerto de servicio:</span>
            <code className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">3000</code>
          </div>
        </div>

        {/* Tab View Routing */}
        {activeTab === 'explorer' && (
          <CountryExplorer
            countries={countries}
            isLoading={isLoadingCountries}
            onRefresh={fetchStatusAndCountries}
          />
        )}

        {activeTab === 'tester' && (
          <EndpointTester onMutated={fetchStatusAndCountries} />
        )}

        {activeTab === 'capital' && (
          <CapitalFinder />
        )}

        {activeTab === 'docs' && (
          <SwaggerViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            API División Política • Proyecto ITM SE migrado y funcionando en AI Studio
          </p>
          <p className="text-slate-400">
            Arquitectura MVC con Repositorios, Controladores, Rutas, Validadores y Swagger UI
          </p>
        </div>
      </footer>
    </div>
  );
}
