import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, RotateCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export default function ServerErrorPage({ error, resetErrorBoundary }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (resetErrorBoundary) resetErrorBoundary();
    navigate('/');
  };

  const errorMessage = error?.message || 'Server bilan bog\'lanishda kutilmagan xatolik yuz berdi.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="w-full max-w-lg text-center animate-scale-in">
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl border border-surface-700/80">
          {/* Error Badge */}
          <div className="relative mx-auto mb-6 w-20 h-20 rounded-3xl bg-danger-500/10 border border-danger-500/30 flex items-center justify-center text-danger-500 shadow-sm">
            <AlertOctagon className="w-10 h-10" />
            <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-danger-500 text-white font-black text-xs shadow">
              500
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-100">
            Serverda xatolik yuz berdi
          </h1>
          <p className="text-surface-400 text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
            Server bilan ma'lumot almashishda uzilish yuz berdi yoki kutilmagan ichki xatolik yuzaga keldi.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={handleReload}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCw className="w-4 h-4" />
              Qayta urinish
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-surface-200 hover:bg-surface-800 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Bosh sahifa
            </button>
          </div>

          {/* Collapsible Technical Details */}
          <div className="mt-8 pt-5 border-t border-surface-700/60 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-xs font-semibold text-surface-400 hover:text-surface-200 transition-colors"
            >
              <span>Texnik ma'lumotlar</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDetails && (
              <div className="mt-3 p-3 rounded-xl bg-surface-900 border border-surface-800 text-[11px] font-mono text-danger-400 overflow-x-auto max-h-48 leading-relaxed">
                <p className="font-bold text-surface-300 mb-1">Xatolik xabari:</p>
                <p className="break-all">{errorMessage}</p>
                {error?.stack && (
                  <pre className="mt-2 text-surface-500 text-[10px] whitespace-pre-wrap break-all">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
