import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';
import {
  formatUZS, formatKg, formatDateTime, getErrorMessage,
  TRANSACTION_TYPES, PAYMENT_METHODS
} from '../utils';
import {
  ArrowLeftRight, Filter, ChevronLeft, ChevronRight,
  Eye, Calendar, Printer, X, CheckCircle2, Clock, User, Phone, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/ui/Skeleton';
import Select from '../components/ui/Select';
import DatePicker from '../components/ui/DatePicker';

function TransactionDetailModal({ tx, onClose }) {
  if (!tx) return null;

  const isSale = tx.type === 'sale';
  const isReturn = tx.type?.includes('return');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass rounded-2xl p-6 w-full max-w-lg animate-scale-in text-surface-100 shadow-2xl print:bg-white print:text-black print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-surface-700/60 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                tx.type === 'sale'
                  ? 'bg-success-500/10 text-success-600 dark:text-success-400'
                  : tx.type === 'purchase'
                  ? 'bg-primary-500/10 text-primary-500'
                  : 'bg-warning-500/10 text-warning-500'
              }`}>
                {TRANSACTION_TYPES[tx.type] || tx.type}
              </span>
              <span className="text-xs text-surface-400 font-mono">
                ID: {tx._id?.slice(-8)}
              </span>
            </div>
            <p className="text-xs text-surface-400">
              {formatDateTime(tx.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counterparty / Customer info */}
        {(tx.customerName || tx.supplierName) && (
          <div className="py-3 border-b border-surface-700/60 text-xs flex flex-wrap justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-surface-400" />
              <span className="text-surface-400">Mijoz / Yetkazib beruvchi:</span>
              <strong className="text-surface-100">{tx.customerName || tx.supplierName}</strong>
            </div>
            {(tx.customerPhone || tx.supplierPhone) && (
              <div className="flex items-center gap-1.5 text-surface-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{tx.customerPhone || tx.supplierPhone}</span>
              </div>
            )}
          </div>
        )}

        {/* Items Table */}
        <div className="py-4 border-b border-surface-700/60 max-h-56 overflow-y-auto">
          <p className="text-xs font-bold text-surface-300 mb-2">Mahsulotlar tarkibi:</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-surface-400 border-b border-surface-700/40 pb-1.5 text-left">
                <th className="pb-1.5 font-semibold">Mahsulot</th>
                <th className="pb-1.5 font-semibold text-center">Miqdor</th>
                <th className="pb-1.5 font-semibold text-right">Narxi (kg)</th>
                <th className="pb-1.5 font-semibold text-right">Jami</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {tx.items?.map((item, i) => {
                const unitLabel = item.inputUnit === 'bag' ? 'qop' : item.inputUnit === 'ton' ? 'ton' : 'kg';
                return (
                  <tr key={i} className="py-1.5">
                    <td className="py-1.5 font-medium text-surface-100">
                      {item.product?.name || item.productName || 'Noma\'lum mahsulot'}
                    </td>
                    <td className="py-1.5 text-center text-surface-300">
                      {item.inputQuantity} {unitLabel}
                      {item.calculatedKg && item.inputUnit !== 'kg' && (
                        <span className="text-[10px] text-surface-500 block">
                          ({formatKg(item.calculatedKg)})
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 text-right text-surface-400">
                      {formatUZS(item.unitPricePerKg)}
                    </td>
                    <td className="py-1.5 text-right font-bold text-surface-200">
                      {formatUZS(item.lineTotal)} so'm
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="py-3 border-b border-surface-700/60 space-y-1.5 text-xs">
          <div className="flex justify-between text-sm font-bold">
            <span>Umumiy summa:</span>
            <span className="text-primary-600 dark:text-primary-400 text-base">
              {formatUZS(tx.totalAmount)} so'm
            </span>
          </div>
          <div className="flex justify-between text-surface-400">
            <span>To'lov usuli:</span>
            <span className="font-semibold text-surface-200">
              {PAYMENT_METHODS[tx.paymentMethod] || tx.paymentMethod || '—'}
            </span>
          </div>
          <div className="flex justify-between text-surface-400">
            <span>To'langan summa:</span>
            <span className="font-semibold text-success-600 dark:text-success-400">
              {formatUZS(tx.paidAmount)} so'm
            </span>
          </div>
          {tx.paymentMethod === 'credit' && (
            <div className="flex justify-between text-warning-500 font-bold pt-1">
              <span>Nasiya qarzi:</span>
              <span>{formatUZS(Math.max(0, tx.totalAmount - tx.paidAmount))} so'm</span>
            </div>
          )}
          {tx.notes && (
            <div className="pt-2 text-surface-400 text-xs italic">
              <strong>Izoh:</strong> {tx.notes}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 pt-4 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl border border-surface-700 bg-surface-800 text-surface-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Chop etish
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, skip: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', from: '', to: '' });
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeDatePreset, setActiveDatePreset] = useState('all');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pagination.limit, skip: pagination.skip };
      if (filters.type) params.type = filters.type;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.data);
      setPagination((prev) => ({ ...prev, total: res.data.pagination.total }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.skip, pagination.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;

  // Preset Date Handlers
  const applyDatePreset = (preset) => {
    setActiveDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'today') {
      setFilters((prev) => ({ ...prev, from: todayStr, to: todayStr }));
    } else if (preset === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().split('T')[0];
      setFilters((prev) => ({ ...prev, from: yestStr, to: yestStr }));
    } else if (preset === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      setFilters((prev) => ({ ...prev, from: weekAgo.toISOString().split('T')[0], to: todayStr }));
    } else if (preset === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setFilters((prev) => ({ ...prev, from: startOfMonth.toISOString().split('T')[0], to: todayStr }));
    } else {
      setFilters((prev) => ({ ...prev, from: '', to: '' }));
    }
    setPagination((p) => ({ ...p, skip: 0 }));
  };

  const resetFilters = () => {
    setFilters({ type: '', from: '', to: '' });
    setActiveDatePreset('all');
    setPagination((p) => ({ ...p, skip: 0 }));
  };

  const typeStyles = {
    sale: 'bg-success-500/10 text-success-600 dark:text-success-400 border-success-500/20',
    purchase: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
    sale_return: 'bg-warning-500/10 text-warning-500 border-warning-500/20',
    purchase_return: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
    adjustment: 'bg-surface-800 text-surface-400 border-surface-700',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-surface-100">
            <ArrowLeftRight className="w-6 h-6 text-primary-500" />
            Tranzaksiyalar Tarixi
          </h1>
          <p className="text-xs text-surface-400 mt-0.5">
            Barcha kirim, savdo, qaytim va ombor o'zgarishlarining to'liq auditi
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-900 border border-surface-700 text-surface-300 self-start sm:self-auto">
          Jami yozuvlar: <strong className="text-primary-500">{pagination.total} ta</strong>
        </div>
      </div>

      {/* Date Presets Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-surface-400 flex items-center gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          Tezkor davr:
        </span>
        {[
          { key: 'today', label: 'Bugun' },
          { key: 'yesterday', label: 'Kecha' },
          { key: 'week', label: 'Oxirgi 7 kun' },
          { key: 'month', label: 'Bu oy' },
          { key: 'all', label: 'Barchasi' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => applyDatePreset(key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeDatePreset === key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-surface-900 border border-surface-700 text-surface-400 hover:text-surface-200 hover:bg-surface-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter controls */}
      <div className="bg-surface-900 border border-surface-700 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Type filter */}
          <div>
            <label className="text-xs font-semibold text-surface-400 mb-1.5 block">Harakat turi</label>
            <Select
              options={[
                { value: '', label: 'Barcha harakatlar' },
                ...Object.entries(TRANSACTION_TYPES).map(([value, label]) => ({ value, label })),
              ]}
              value={filters.type}
              onChange={(value) => {
                setFilters({ ...filters, type: value });
                setPagination((p) => ({ ...p, skip: 0 }));
              }}
              placeholder="Barcha harakatlar"
              size="sm"
            />
          </div>

          {/* Date from */}
          <div>
            <label className="text-xs font-semibold text-surface-400 mb-1.5 block">Boshlanish sanasi</label>
            <DatePicker
              value={filters.from}
              onChange={(dateStr) => {
                setActiveDatePreset('');
                setFilters({ ...filters, from: dateStr });
                setPagination((p) => ({ ...p, skip: 0 }));
              }}
              placeholder="Boshlanish sanasi"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="text-xs font-semibold text-surface-400 mb-1.5 block">Tugash sanasi</label>
            <DatePicker
              value={filters.to}
              onChange={(dateStr) => {
                setActiveDatePreset('');
                setFilters({ ...filters, to: dateStr });
                setPagination((p) => ({ ...p, skip: 0 }));
              }}
              placeholder="Tugash sanasi"
            />
          </div>

          {/* Reset Filters button */}
          <div>
            <button
              type="button"
              onClick={resetFilters}
              className="w-full py-2 px-3 rounded-xl border border-surface-700 text-xs font-semibold text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              Filtrlarni tozalash
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 bg-surface-900 border border-surface-700 rounded-2xl p-6">
          <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-surface-400/40" />
          <h3 className="font-semibold text-surface-200">Tranzaksiyalar mavjud emas</h3>
          <p className="text-xs text-surface-400 mt-1">Ushbu sana oralig'ida hali hech qanday amal bajarilmagan</p>
        </div>
      ) : (
        <div className="bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-800/40 text-surface-400">
                  <th className="text-left py-3 px-4 font-semibold">Sana va vaqt</th>
                  <th className="text-left py-3 px-4 font-semibold">Turi</th>
                  <th className="text-left py-3 px-4 font-semibold">Mahsulotlar</th>
                  <th className="text-left py-3 px-4 font-semibold">Mijoz / Hamkor</th>
                  <th className="text-right py-3 px-4 font-semibold">Jami summa</th>
                  <th className="text-right py-3 px-4 font-semibold">To'langan</th>
                  <th className="text-center py-3 px-4 font-semibold">To'lov</th>
                  <th className="text-center py-3 px-4 font-semibold">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/70">
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-surface-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 text-surface-300 whitespace-nowrap font-medium">
                      {formatDateTime(tx.date)}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${typeStyles[tx.type] || 'bg-surface-800 text-surface-300'}`}>
                        {TRANSACTION_TYPES[tx.type] || tx.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-surface-200 font-medium max-w-[200px] truncate">
                      {tx.items?.map((item) => item.product?.name || 'N/A').join(', ') || '—'}
                    </td>

                    <td className="py-3 px-4 text-surface-300 max-w-[150px] truncate">
                      {tx.customerName || tx.supplierName || '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-surface-100 whitespace-nowrap">
                      {formatUZS(tx.totalAmount)} so'm
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-success-600 dark:text-success-400 whitespace-nowrap">
                      {formatUZS(tx.paidAmount)} so'm
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] font-medium text-surface-400 px-2 py-0.5 rounded bg-surface-800 border border-surface-700">
                        {PAYMENT_METHODS[tx.paymentMethod] || tx.paymentMethod || '—'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="p-1.5 rounded-lg border border-surface-700 bg-surface-800 text-surface-400 group-hover:text-primary-500 group-hover:border-primary-500/40 transition-colors"
                        title="Batafsil ko'rish"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700 bg-surface-800/30">
              <span className="text-xs text-surface-400">
                Ko'rsatilmoqda: <strong>{pagination.skip + 1}</strong> — <strong>{Math.min(pagination.skip + pagination.limit, pagination.total)}</strong> (Jami: {pagination.total})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPagination((p) => ({ ...p, skip: Math.max(0, p.skip - p.limit) }))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-100 hover:bg-surface-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-surface-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPagination((p) => ({ ...p, skip: p.skip + p.limit }))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-100 hover:bg-surface-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <TransactionDetailModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}
