import { useState, useEffect } from 'react';
import api from '../api';
import { formatUZS, formatKg, getErrorMessage } from '../utils';
import { BarChart3, TrendingUp, Package, Receipt, CreditCard, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from '../components/ui/DatePicker';
import { Skeleton, CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';

export default function ReportPage() {
 const [report, setReport] = useState(null);
 const [loading, setLoading] = useState(true);
 const [date, setDate] = useState('');

 const fetchReport = async () => {
  setLoading(true);
  try {
   const params = {};
   if (date) params.date = date;
   const res = await api.get('/reports/daily', { params });
   setReport(res.data);
  } catch (err) {
   toast.error(getErrorMessage(err));
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => { fetchReport(); }, [date]);

 if (loading) {
  return (
   <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
     <div className="flex items-center gap-2">
      <Skeleton className="w-6 h-6 rounded-lg" />
      <Skeleton className="h-7 w-48 rounded-xl" />
     </div>
     <Skeleton className="h-10 w-60 rounded-xl" />
    </div>
    <CardSkeleton count={6} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
     <TableSkeleton rows={4} cols={3} />
     <TableSkeleton rows={4} cols={3} />
    </div>
   </div>
  );
 }

 if (!report) {
  return <div className="text-center py-16 text-surface-400">Hisobot yuklanmadi</div>;
 }

 const lowStockProducts = report.stock?.filter((p) => p.isLowStock) || [];

 return (
  <div className="space-y-6">
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <h1 className="text-2xl font-bold flex items-center gap-2">
     <BarChart3 className="w-6 h-6 text-primary-400" />
     Kunlik hisobot
    </h1>
    <div className="w-full sm:w-60">
     <DatePicker
      value={date || report.date}
      onChange={(val) => setDate(val)}
      placeholder="Hisobot sanasi"
     />
    </div>
   </div>

   <p className="text-surface-400 text-sm">
    {report.date} • {report.timezone} • {report.period?.from && `${report.period.from.slice(0, 16)} — ${report.period.toExclusive.slice(0, 16)}`}
   </p>

   {/* Summary cards */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[
     { icon: DollarSign, label: 'Savdo', value: formatUZS(report.sales.salesTotal), bg: 'bg-primary-500/10', color: 'text-primary-600 dark:text-primary-400', sub: `${report.sales.transactionCount} ta savdo` },
     { icon: TrendingUp, label: 'Tushum', value: formatUZS(report.sales.paidTotal), bg: 'bg-primary-500/10', color: 'text-primary-600 dark:text-primary-400', sub: 'Naqd va karta' },
     { icon: CreditCard, label: 'Nasiya savdo', value: formatUZS(report.sales.creditTotal), bg: 'bg-surface-800', color: 'text-surface-300', sub: `To'lovlar: ${formatUZS(report.debtCollections.totalAmount)}` },
     { icon: Receipt, label: 'Harajat', value: formatUZS(report.expenses.totalAmount), bg: 'bg-surface-800', color: 'text-surface-300', sub: `${report.expenses.categories?.length || 0} kategoriya` },
     { icon: CreditCard, label: 'Nasiya to\'lovlari', value: formatUZS(report.debtCollections.totalAmount), bg: 'bg-primary-500/10', color: 'text-primary-600 dark:text-primary-400', sub: `${report.debtCollections.paymentCount} ta to'lov` },
     { icon: Package, label: 'Kam qolgan', value: `${lowStockProducts.length} ta`, bg: lowStockProducts.length > 0 ? 'bg-warning-500/10' : 'bg-primary-500/10', color: lowStockProducts.length > 0 ? 'text-warning-500' : 'text-primary-600 dark:text-primary-400', sub: 'Mahsulotlar' },
    ].map(({ icon: Icon, label, value, bg, color, sub }, i) => (
     <div key={i} className="glass rounded-2xl p-5 animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
      <div className="flex items-start justify-between">
       <div>
        <p className="text-sm text-surface-400">{label}</p>
        <p className="text-xl font-bold text-surface-100 mt-1">{value} {label !== 'Kam qolgan' ? "so'm" : ''}</p>
        <p className="text-xs text-surface-500 mt-1">{sub}</p>
       </div>
       <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0 border border-surface-700/60`}>
        <Icon className="w-5 h-5" />
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* Top products */}
   <div className="glass rounded-2xl p-5">
    <h2 className="text-lg font-semibold mb-4">Eng ko'p sotilgan yemlar</h2>
    {report.topProducts?.length > 0 ? (
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead>
        <tr className="border-b border-surface-700/50">
         <th className="text-left py-2 px-3 text-surface-400 font-medium">#</th>
         <th className="text-left py-2 px-3 text-surface-400 font-medium">Nomi</th>
         <th className="text-right py-2 px-3 text-surface-400 font-medium">Miqdori</th>
         <th className="text-right py-2 px-3 text-surface-400 font-medium">Tushum</th>
        </tr>
       </thead>
       <tbody>
        {report.topProducts.map((product, i) => (
         <tr key={product.productId || i} className="border-b border-surface-800/50">
          <td className="py-2.5 px-3">
           <span className="w-6 h-6 rounded-lg bg-primary-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {i + 1}
           </span>
          </td>
          <td className="py-2.5 px-3 text-surface-200 font-medium">{product.name}</td>
          <td className="py-2.5 px-3 text-right text-surface-300">{formatKg(product.quantityKg)}</td>
          <td className="py-2.5 px-3 text-right text-success-400 font-medium">{formatUZS(product.revenue)} so'm</td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    ) : (
     <p className="text-surface-500 text-center py-8">Bugun savdo yo'q</p>
    )}
   </div>

   {/* Expense categories */}
   {report.expenses.categories?.length > 0 && (
    <div className="glass rounded-2xl p-5">
     <h2 className="text-lg font-semibold mb-4">Harajat kategoriyalari</h2>
     <div className="space-y-2">
      {report.expenses.categories.map((cat) => (
       <div key={cat._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30">
        <div className="flex items-center gap-3">
         <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-danger-500/10 text-danger-400">
          {cat._id}
         </span>
         <span className="text-xs text-surface-500">{cat.count} ta</span>
        </div>
        <span className="text-danger-400 font-medium">{formatUZS(cat.totalAmount)} so'm</span>
       </div>
      ))}
     </div>
    </div>
   )}
  </div>
 );
}
