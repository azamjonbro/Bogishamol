import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';
import {
  formatUZS, formatKg, formatDateTime, getErrorMessage,
  TRANSACTION_TYPES, PAYMENT_METHODS
} from '../utils';
import {
  ArrowLeftRight, Filter, ChevronLeft, ChevronRight,
  Eye, Calendar, Printer, X, CheckCircle2, Clock, User, Phone, FileText,
  Edit2, Trash2, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/ui/Skeleton';
import Select from '../components/ui/Select';
import DatePicker from '../components/ui/DatePicker';

function TransactionDetailModal({ tx, onClose, onEdit }) {
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
            onClick={() => {
              const current = tx;
              onClose();
              onEdit?.(current);
            }}
            className="flex-1 py-2.5 rounded-xl border border-warning-500/30 bg-warning-500/10 text-warning-500 hover:bg-warning-500/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Tahrirlash
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

function TransactionEditModal({ tx, onClose, onSaved, onDeleted }) {
  if (!tx) return null;

  const [date, setDate] = useState(
    tx.date ? new Date(tx.date).toISOString().split('T')[0] : ''
  );
  const [customerName, setCustomerName] = useState(tx.customerName || tx.supplierName || '');
  const [customerPhone, setCustomerPhone] = useState(tx.customerPhone || tx.supplierPhone || '');
  const [paymentMethod, setPaymentMethod] = useState(tx.paymentMethod || 'cash');
  const [paidAmount, setPaidAmount] = useState(tx.paidAmount ?? 0);
  const [notes, setNotes] = useState(tx.notes || '');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isSale = tx.type === 'sale';
  const isPurchase = tx.type === 'purchase';

  const paymentOptions = [
    { value: 'cash', label: 'Naqd pul' },
    { value: 'card', label: 'Plastik karta' },
    { value: 'transfer', label: "Bank o'tkazmasi" },
    ...(isSale ? [{ value: 'credit', label: 'Nasiya' }] : []),
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        date,
        paymentMethod,
        paidAmount: Number(paidAmount),
        notes: notes.trim(),
        ...(isSale ? { customerName: customerName.trim(), customerPhone: customerPhone.trim() } : {}),
        ...(isPurchase ? { supplierName: customerName.trim(), supplierPhone: customerPhone.trim() } : {}),
        ...(paymentMethod === 'credit' && dueDate ? { dueDate } : {}),
      };

      await api.patch(`/transactions/${tx._id}`, payload);
      toast.success('Tranzaksiya muvaffaqiyatli yangilandi');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Haqiqatan ham bu tranzaksiyani o'chirmoqchimisiz? Ombor qoldig'i avtomatik qaytariladi.")) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/transactions/${tx._id}`);
      toast.success("Tranzaksiya o'chirildi va ombor qoldig'i tiklandi");
      onDeleted();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass rounded-2xl p-6 w-full max-w-lg animate-scale-in text-surface-100 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-surface-700/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-warning-500/10 text-warning-500 border border-warning-500/20">
                Tahrirlash
              </span>
              <span className="text-xs text-surface-400 font-mono">
                ID: {tx._id?.slice(-8)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-surface-100">Tranzaksiyani tahrirlash</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Sana */}
          <div>
            <label className="text-xs font-semibold text-surface-400 mb-1.5 block">Sana</label>
            <DatePicker
              value={date}
              onChange={(val) => setDate(val)}
              placeholder="Sanani tanlang"
            />
          </div>

          {/* Mijoz / Yetkazib beruvchi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-surface-400 mb-1.5 block">
                {isPurchase ? 'Yetkazib beruvchi' : 'Mijoz ismi'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="F.I.SH."
                className="w-full px-3.5 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs font-medium text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-400 mb-1.5 block">Telefon raqami</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs font-medium text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* To'lov usuli */}
          <div>
            <label className="text-xs font-semibold text-surface-400 mb-1.5 block">To'lov usuli</label>
            <Select
              options={paymentOptions}
              value={paymentMethod}
              onChange={(val) => setPaymentMethod(val)}
              searchable={false}
            />
          </div>

          {/* To'langan summa */}
          <div>
            <label className="text-xs font-semibold text-surface-400 mb-1.5 block">
              To'langan summa (Jami: {formatUZS(tx.totalAmount)} so'm)
            </label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              min="0"
              max={tx.totalAmount}
              step="any"
              className="w-full px-3.5 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs font-semibold text-surface-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Nasiya to'lash muddati */}
          {paymentMethod === 'credit' && (
            <div>
              <label className="text-xs font-semibold text-surface-400 mb-1.5 block">Nasiya to'lash muddati</label>
              <DatePicker
                value={dueDate}
                onChange={(val) => setDueDate(val)}
                placeholder="Muddatni tanlang"
              />
            </div>
          )}

          {/* Izoh */}
          <div>
            <label className="text-xs font-semibold text-surface-400 mb-1.5 block">Izoh</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Qo'shimcha ma'lumot yoki izoh..."
              className="w-full px-3.5 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs font-medium text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          {/* Mahsulotlar (ma'lumot uchun) */}
          <div className="p-3 rounded-xl bg-surface-900/60 border border-surface-700/60 text-xs">
            <p className="font-semibold text-surface-400 mb-1.5">Tranzaksiya tarkibi:</p>
            <div className="space-y-1">
              {tx.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-surface-300">
                  <span>{item.product?.name || item.productName || 'Mahsulot'} ({item.inputQuantity} {item.inputUnit})</span>
                  <span className="font-mono text-surface-200">{formatUZS(item.lineTotal)} so'm</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-surface-700/60">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="py-2.5 px-3.5 rounded-xl border border-danger-500/30 text-danger-500 hover:bg-danger-500/10 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              O'chirish
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-surface-700 bg-surface-800 text-surface-300 hover:text-surface-100 font-semibold text-xs transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="py-2.5 px-5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </form>
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
  const [editingTx, setEditingTx] = useState(null);
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
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(tx);
                          }}
                          className="p-1.5 rounded-lg border border-surface-700 bg-surface-800 text-surface-400 hover:text-primary-500 hover:border-primary-500/40 transition-colors"
                          title="Batafsil ko'rish"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTx(tx);
                          }}
                          className="p-1.5 rounded-lg border border-surface-700 bg-surface-800 text-surface-400 hover:text-warning-500 hover:border-warning-500/40 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
          onEdit={(tx) => setEditingTx(tx)}
        />
      )}

      {/* Transaction Edit Modal */}
      {editingTx && (
        <TransactionEditModal
          tx={editingTx}
          onClose={() => setEditingTx(null)}
          onSaved={() => {
            setEditingTx(null);
            fetchTransactions();
          }}
          onDeleted={() => {
            setEditingTx(null);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
