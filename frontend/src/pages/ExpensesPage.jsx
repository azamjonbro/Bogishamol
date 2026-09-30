import { useState, useEffect } from 'react';
import api from '../api';
import { formatUZS, formatDate, getErrorMessage } from '../utils';
import { Receipt, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from '../components/ui/Select';
import DatePicker from '../components/ui/DatePicker';
import { TableSkeleton } from '../components/ui/Skeleton';

function ExpenseModal({ onClose, onSaved }) {
 const [form, setForm] = useState({
  category: '',
  amount: '',
  description: '',
  paymentMethod: 'cash',
  recipient: '',
  reference: '',
 });
 const [saving, setSaving] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  try {
   await api.post('/expenses', {
    ...form,
    amount: Number(form.amount),
   });
   toast.success('Harajat kiritildi');
   onSaved();
  } catch (err) {
   toast.error(getErrorMessage(err));
  } finally {
   setSaving(false);
  }
 };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
   <div className="glass rounded-2xl p-6 w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between mb-5">
     <h2 className="text-lg font-semibold">Yangi harajat</h2>
     <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-700"><X className="w-5 h-5" /></button>
    </div>
    <form onSubmit={handleSubmit} className="space-y-4">
     <div>
      <label className="text-sm text-surface-400 mb-1 block">Kategoriya *</label>
      <input
       type="text"
       value={form.category}
       onChange={(e) => setForm({ ...form, category: e.target.value })}
       placeholder="Transport, Elektr, Ish haqi..."
       className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
       required
      />
     </div>
     <div>
      <label className="text-sm text-surface-400 mb-1 block">Summa (UZS) *</label>
      <input
       type="number"
       value={form.amount}
       onChange={(e) => setForm({ ...form, amount: e.target.value })}
       placeholder="0"
       className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
       min="1"
       step="any"
       required
      />
     </div>
     <div>
      <label className="text-sm text-surface-400 mb-1 block">Tavsif</label>
      <input
       type="text"
       value={form.description}
       onChange={(e) => setForm({ ...form, description: e.target.value })}
       placeholder="Ixtiyoriy tavsif"
       className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
      />
     </div>
     <div className="grid grid-cols-2 gap-3">
      <div>
       <label className="text-sm text-surface-400 mb-1 block">To'lov usuli</label>
       <Select
        options={[
         { value: 'cash', label: 'Naqd' },
         { value: 'card', label: 'Karta' },
         { value: 'transfer', label: 'O\'tkazma' },
        ]}
        value={form.paymentMethod}
        onChange={(val) => setForm({ ...form, paymentMethod: val })}
        searchable={false}
       />
      </div>
      <div>
       <label className="text-sm text-surface-400 mb-1 block">Oluvchi</label>
       <input
        type="text"
        value={form.recipient}
        onChange={(e) => setForm({ ...form, recipient: e.target.value })}
        placeholder="Ixtiyoriy"
        className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
       />
      </div>
     </div>
     <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-600 text-surface-300 hover:bg-surface-800">
       Bekor
      </button>
      <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors shadow-sm">
       {saving ? 'Saqlanmoqda...' : 'Kiritish'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}

export default function ExpensesPage() {
 const [expenses, setExpenses] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showModal, setShowModal] = useState(false);
 const [filters, setFilters] = useState({ from: '', to: '', category: '' });

 const fetchExpenses = async () => {
  setLoading(true);
  try {
   const params = {};
   if (filters.from) params.from = filters.from;
   if (filters.to) params.to = filters.to;
   if (filters.category) params.category = filters.category;
   const res = await api.get('/expenses', { params });
   setExpenses(res.data.data);
  } catch (err) {
   toast.error(getErrorMessage(err));
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => { fetchExpenses(); }, [filters.from, filters.to, filters.category]);

 const total = expenses.reduce((sum, e) => sum + e.amount, 0);
 const categories = [...new Set(expenses.map((e) => e.category))];

 return (
  <div className="space-y-5">
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <h1 className="text-2xl font-bold flex items-center gap-2">
     <Receipt className="w-6 h-6 text-primary-400" />
     Harajatlar
    </h1>
    <button
     onClick={() => setShowModal(true)}
     id="add-expense-button"
     className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-sm"
    >
     <Plus className="w-4 h-4" />
     Yangi harajat
    </button>
   </div>

   {/* Filters & Total */}
   <div className="flex flex-wrap gap-3 items-end">
    <div className="w-40">
     <label className="text-xs text-surface-400 mb-1 block">Dan</label>
     <DatePicker
      value={filters.from}
      onChange={(val) => setFilters({ ...filters, from: val })}
      placeholder="Boshlanish"
     />
    </div>
    <div className="w-40">
     <label className="text-xs text-surface-400 mb-1 block">Gacha</label>
     <DatePicker
      value={filters.to}
      onChange={(val) => setFilters({ ...filters, to: val })}
      placeholder="Tugash"
     />
    </div>
    <div className="ml-auto glass rounded-xl px-4 py-2.5">
     <span className="text-surface-400 text-sm">Jami: </span>
     <span className="text-danger-400 font-bold">{formatUZS(total)} so'm</span>
    </div>
   </div>

   {/* List */}
   {loading ? (
    <TableSkeleton rows={5} cols={5} />
   ) : expenses.length === 0 ? (
    <div className="text-center py-16 text-surface-400">
     <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
     <p>Harajat topilmadi</p>
    </div>
   ) : (
    <div className="glass rounded-2xl overflow-hidden">
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead>
        <tr className="border-b border-surface-700/50">
         <th className="text-left py-3 px-4 text-surface-400 font-medium">Sana</th>
         <th className="text-left py-3 px-4 text-surface-400 font-medium">Kategoriya</th>
         <th className="text-left py-3 px-4 text-surface-400 font-medium">Tavsif</th>
         <th className="text-right py-3 px-4 text-surface-400 font-medium">Summa</th>
         <th className="text-left py-3 px-4 text-surface-400 font-medium">To'lov</th>
        </tr>
       </thead>
       <tbody>
        {expenses.map((expense) => (
         <tr key={expense._id} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
          <td className="py-3 px-4 text-surface-300 whitespace-nowrap">{formatDate(expense.date)}</td>
          <td className="py-3 px-4">
           <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-danger-500/10 text-danger-400">
            {expense.category}
           </span>
          </td>
          <td className="py-3 px-4 text-surface-300 max-w-[200px] truncate">{expense.description || '—'}</td>
          <td className="py-3 px-4 text-right font-medium text-danger-400">{formatUZS(expense.amount)}</td>
          <td className="py-3 px-4 text-xs text-surface-400">
           {expense.paymentMethod === 'cash' ? 'Naqd' : expense.paymentMethod === 'card' ? 'Karta' : 'O\'tkazma'}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   {showModal && (
    <ExpenseModal
     onClose={() => setShowModal(false)}
     onSaved={() => { setShowModal(false); fetchExpenses(); }}
    />
   )}
  </div>
 );
}
