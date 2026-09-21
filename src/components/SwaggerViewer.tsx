import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, Code, CheckCircle } from 'lucide-react';

export const SwaggerViewer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>OpenAPI 3.0 / Swagger UI</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Documentación Interactiva Swagger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Servida nativamente en <code className="text-sky-700 font-mono">/api-docs</code> vía <code className="font-mono text-slate-700">swagger-ui-express</code> y especificación JSON en <code className="text-sky-700 font-mono">/api-docs.json</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            id="btn-open-swagger-newtab"
            href="/api-docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Abrir en Pestaña Nueva</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            id="btn-download-openapi-spec"
            href="/api-docs.json"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Ver OpenAPI JSON</span>
          </a>
        </div>
      </div>

      {/* Embedded Swagger UI frame */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden h-[700px] flex flex-col">
        <div className="bg-slate-900 text-slate-300 px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 font-mono text-slate-400">http://localhost:3000/api-docs</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Swagger UI 5.x Activo
          </span>
        </div>
        <iframe
          src="/api-docs"
          title="Swagger UI"
          className="w-full flex-1 border-0"
        />
      </div>
    </div>
  );
};
