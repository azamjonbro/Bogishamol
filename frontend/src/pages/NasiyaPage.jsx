import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { formatUZS, formatDate, getErrorMessage, NASIYA_STATUSES } from '../utils';
import { CreditCard, Search, Clock, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from '../components/ui/Select';
import { CardSkeleton } from '../components/ui/Skeleton';

function PaymentModal({ nasiya, onClose, onPaid }) {
 const [amount, setAmount] = useState('');
 const [method, setMethod] = useState('cash');
 const [note, setNote] = useState('');
 const [saving, setSaving] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) return toast.error('Summani kiriting');
  if (numAmount > nasiya.balanceAmount) return toast.error('Qarz qoldig\'idan oshmasligi kerak');

  setSaving(true);
  try {
   await api.post(`/nasiya/${nasiya._id}/payments`, { amount: numAmount, method, note: note.trim() || undefined });
   toast.success('To\'lov qabul qilindi');
   onPaid();
  } catch (err) {
   toast.error(getErrorMessage(err));
  } finally {
   setSaving(false);
  }
 };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
   <div className="glass rounded-2xl p-6 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between mb-4">
     <h2 className="text-lg font-semibold">Qarz to'lovi</h2>
     <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-700"><X className="w-5 h-5" /></button>
    </div>

    <div className="p-3 rounded-xl bg-surface-800/40 mb-4">
     <p className="text-surface-200 font-medium">{nasiya.customerName}</p>
     <div className="flex justify-between mt-1 text-sm">
      <span className="text-surface-500">Qarz qoldig'i:</span>
      <span className="text-warning-400 font-semibold">{formatUZS(nasiya.balanceAmount)} so'm</span>
     </div>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
     <div>
      <label className="text-sm text-surface-400 mb-1 block">To'lov summasi *</label>
      <input
       type="number"
       value={amount}
       onChange={(e) => setAmount(e.target.value)}
       placeholder="0"
       className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 focus:outline-none focus:border-primary-500"
       min="1"
       max={nasiya.balanceAmount}
       step="any"
       required
      />
      <div className="flex gap-2 mt-1.5">
       <button
        type="button"
        onClick={() => setAmount(String(Math.round(nasiya.balanceAmount / 2)))}
        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700 transition-colors"
       >
        50% ({formatUZS(Math.round(nasiya.balanceAmount / 2))})
       </button>
       <button
        type="button"
        onClick={() => setAmount(String(nasiya.balanceAmount))}
        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20 transition-colors"
       >
        100% to'liq ({formatUZS(nasiya.balanceAmount)})
       </button>
      </div>
     </div>
     <div>
      <label className="text-sm text-surface-400 mb-1 block">To'lov usuli</label>
      <Select
       options={[
        { value: 'cash', label: 'Naqd' },
        { value: 'card', label: 'Karta' },
        { value: 'transfer', label: 'O\'tkazma' },
       ]}
       value={method}
       onChange={(val) => setMethod(val)}
       searchable={false}
      />
     </div>
     <div>
      <label className="text-sm text-surface-400 mb-1 block">Izoh</label>
      <input
       type="text"
       value={note}
       onChange={(e) => setNote(e.target.value)}
       placeholder="Ixtiyoriy izoh"
       className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
      />
     </div>
     <div className="flex gap-3">
      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-600 text-surface-300 hover:bg-surface-800">
       Bekor
      </button>
      <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors shadow-sm">
       {saving ? 'Saqlanmoqda...' : 'To\'lash'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}

export default function NasiyaPage() {
 const [nasiyaList, setNasiyaList] = useState([]);
 const [pagination, setPagination] = useState({ total: 0, limit: 50, skip: 0 });
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [overdueOnly, setOverdueOnly] = useState(false);
 const [paymentModal, setPaymentModal] = useState(null);

 const fetchNasiya = useCallback(async () => {
  setLoading(true);
  try {
   const params = { limit: pagination.limit, skip: pagination.skip };
   if (search.trim()) params.search = search.trim();
   if (statusFilter) params.status = statusFilter;
   if (overdueOnly) params.overdue = 'true';
   const res = await api.get('/nasiya', { params });
   setNasiyaList(res.data.data);
   setPagination((prev) => ({ ...prev, total: res.data.pagination.total }));
  } catch (err) {
   toast.error(getErrorMessage(err));
  } finally {
   setLoading(false);
  }
 }, [search, statusFilter, overdueOnly, pagination.skip, pagination.limit]);

 useEffect(() => {
  const timer = setTimeout(fetchNasiya, 300);
  return () => clearTimeout(timer);
 }, [fetchNasiya]);

 const statusColors = {
  open: 'text-danger-400 bg-danger-500/10',
  partial: 'text-warning-400 bg-warning-500/10',
  paid: 'text-success-400 bg-success-500/10',
 };

 const statusIcons = {
  open: AlertTriangle,
  partial: Clock,
  paid: CheckCircle2,
 };

 return (
  <div className="space-y-5">
   <h1 className="text-2xl font-bold flex items-center gap-2">
    <CreditCard className="w-6 h-6 text-primary-400" />
    Nasiya boshqaruvi
   </h1>

   {/* Filters */}
   <div className="flex flex-wrap gap-3">
    <div className="relative flex-1 min-w-[200px]">
     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
     <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Mijoz nomi yoki telefon..."
      id="nasiya-search"
      className="w-full pl-10 pr-4 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
     />
    </div>
    <div className="w-44 shrink-0">
     <Select
      options={[
       { value: '', label: 'Barcha holatlar' },
       { value: 'open', label: 'Ochiq' },
       { value: 'partial', label: 'Qisman' },
       { value: 'paid', label: 'To\'langan' },
      ]}
      value={statusFilter}
      onChange={(val) => { setStatusFilter(val); setOverdueOnly(false); }}
      searchable={false}
      size="sm"
     />
    </div>
    <button
     onClick={() => { setOverdueOnly(!overdueOnly); setStatusFilter(''); }}
     className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
      overdueOnly
       ? 'border-danger-500 bg-danger-500/10 text-danger-400'
       : 'border-surface-700 text-surface-400 hover:border-surface-500'
     }`}
    >
     <Clock className="w-4 h-4" />
     Muddati o'tgan
    </button>
   </div>

   {/* List */}
   {loading ? (
    <CardSkeleton count={4} className="grid-cols-1 md:grid-cols-2" />
   ) : nasiyaList.length === 0 ? (
    <div className="text-center py-16 text-surface-400">
     <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
     <p>Nasiya topilmadi</p>
    </div>
   ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
     {nasiyaList.map((nasiya) => {
      const StatusIcon = statusIcons[nasiya.status] || AlertTriangle;
      const isOverdue = nasiya.status !== 'paid' && new Date(nasiya.dueDate) < new Date();
      return (
       <div key={nasiya._id} className="glass rounded-2xl p-5 animate-fade-in">
        <div className="flex items-start justify-between mb-3">
         <div>
          <h3 className="font-semibold text-surface-100">{nasiya.customerName}</h3>
          {nasiya.customerPhone && <p className="text-xs text-surface-500">{nasiya.customerPhone}</p>}
         </div>
         <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[nasiya.status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {NASIYA_STATUSES[nasiya.status]}
         </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
         <div className="p-2.5 rounded-xl bg-surface-800/40">
          <p className="text-surface-500 text-xs">Jami qarz</p>
          <p className="font-semibold text-surface-200">{formatUZS(nasiya.amount)}</p>
         </div>
         <div className="p-2.5 rounded-xl bg-surface-800/40">
          <p className="text-surface-500 text-xs">Qoldiq</p>
          <p className={`font-semibold ${nasiya.balanceAmount > 0 ? 'text-warning-400' : 'text-success-400'}`}>
           {formatUZS(nasiya.balanceAmount)}
          </p>
         </div>
        </div>

        <div className="flex items-center justify-between text-xs text-surface-500 mb-3">
         <span>Muddat: {formatDate(nasiya.dueDate)}</span>
         <span>To'lovlar: {nasiya.payments?.length || 0}</span>
        </div>

        {isOverdue && (
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger-500/10 text-danger-400 text-xs mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          Muddati o'tgan!
         </div>
        )}

        {nasiya.status !== 'paid' && (
         <button
          onClick={() => setPaymentModal(nasiya)}
          className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
         >
          To'lov qabul qilish
         </button>
        )}
       </div>
      );
     })}
    </div>
   )}

   {paymentModal && (
    <PaymentModal
     nasiya={paymentModal}
     onClose={() => setPaymentModal(null)}
     onPaid={() => { setPaymentModal(null); fetchNasiya(); }}
    />
   )}
  </div>
 );
}
