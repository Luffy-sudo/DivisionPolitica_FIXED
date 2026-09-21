import React from 'react';
import { Globe, BookOpen, RefreshCw, Layers, Terminal, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'explorer' | 'tester' | 'capital' | 'docs';
  setActiveTab: (tab: 'explorer' | 'tester' | 'capital' | 'docs') => void;
  isOnline: boolean;
  totalCountries: number;
  onResetData: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  totalCountries,
  onResetData,
  isResetting,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-100 truncate tracking-tight">
                  API División Política
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                    isOnline
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {isOnline ? 'Online' : 'Conectando'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Microservicio geográfico • {totalCountries} países en memoria
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="tab-explorer"
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'explorer'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Explorador
            </button>
            <button
              id="tab-tester"
              onClick={() => setActiveTab('tester')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tester'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Consola CRUD
            </button>
            <button
              id="tab-capital"
              onClick={() => setActiveTab('capital')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'capital'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Consultar Capital
            </button>
            <button
              id="tab-docs"
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'docs'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Swagger UI
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-reset-data"
              onClick={onResetData}
              disabled={isResetting}
              title="Restablecer datos originales del seed"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-sky-400' : ''}`} />
              <span className="hidden sm:inline">Restablecer BD</span>
            </button>

            <a
              id="link-api-docs"
              href="/api-docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>/api-docs</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'explorer' ? 'bg-sky-600 text-white' : 'text-slate-300'
            }`}
          >
            Explorador
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'tester' ? 'bg-sky-600 text-white' : 'text-slate-300'
            }`}
          >
            Consola CRUD
          </button>
          <button
            onClick={() => setActiveTab('capital')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'capital' ? 'bg-sky-600 text-white' : 'text-slate-300'
            }`}
          >
            Consultar Capital
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'docs' ? 'bg-sky-600 text-white' : 'text-slate-300'
            }`}
          >
            Swagger UI
          </button>
        </div>
      </div>
    </header>
  );
};
