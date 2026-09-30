import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, ShoppingCart, Package, ArrowLeftRight, HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="w-full max-w-lg text-center animate-scale-in">
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-xl border border-surface-700/80">
          {/* 404 Badge & Icon */}
          <div className="relative mx-auto mb-6 w-20 h-20 rounded-3xl bg-primary-600/15 border border-primary-500/30 flex items-center justify-center text-primary-500 shadow-sm">
            <HelpCircle className="w-10 h-10" />
            <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary-600 text-white font-black text-xs shadow">
              404
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-100">
            Sahifa topilmadi
          </h1>
          <p className="text-surface-400 text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
            Siz qidirayotgan sahifa o'chirilgan, nomi o'zgargan yoki vaqtincha mavjud emas.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-surface-200 hover:bg-surface-800 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Ortga qaytish
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Home className="w-4 h-4" />
              Bosh sahifa
            </button>
          </div>

          {/* Quick ERP Links */}
          <div className="mt-8 pt-6 border-t border-surface-700/60">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
              Tezkor bo'limlar:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/pos')}
                className="px-3 py-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-surface-100 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-primary-500" />
                POS Savdo
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-3 py-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-surface-100 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-primary-500" />
                Mahsulotlar
              </button>
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className="px-3 py-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-surface-100 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-primary-500" />
                Tranzaksiyalar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
