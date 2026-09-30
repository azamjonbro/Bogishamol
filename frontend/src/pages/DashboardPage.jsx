import { useState, useEffect } from 'react';
import api from '../api';
import { formatUZS, formatKg, getErrorMessage } from '../utils';
import {
 TrendingUp, TrendingDown, CreditCard, AlertTriangle,
 Package, ShoppingCart, Receipt, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Skeleton, CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';

function StatCard({ icon: Icon, label, value, subtitle, iconBg, iconColor, delay }) {
 return (
  <div
   className="glass rounded-2xl p-5 animate-slide-in hover:scale-[1.01] transition-transform duration-200"
   style={{ animationDelay: `${delay}ms` }}
  >
   <div className="flex items-start justify-between">
    <div className="flex-1">
     <p className="text-xs font-semibold text-surface-400 mb-1">{label}</p>
     <p className="text-2xl font-bold text-surface-100">{value}</p>
     {subtitle && <p className="text-xs text-surface-500 mt-1">{subtitle}</p>}
    </div>
    <div className={`w-11 h-11 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shrink-0 border border-surface-700/60`}>
     <Icon className="w-5 h-5" />
    </div>
   </div>
  </div>
 );
}

export default function DashboardPage() {
 const [report, setReport] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  api.get('/reports/daily')
   .then((res) => setReport(res.data))
   .catch((err) => toast.error(getErrorMessage(err)))
   .finally(() => setLoading(false));
 }, []);

 if (loading) {
  return (
   <div className="space-y-6 animate-fade-in">
    <div className="space-y-2">
     <Skeleton className="h-7 w-48 rounded-xl" />
     <Skeleton className="h-4 w-64 rounded-md" />
    </div>
    <CardSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
     <TableSkeleton rows={4} cols={3} />
     <TableSkeleton rows={4} cols={3} />
    </div>
   </div>
  );
 }

 if (!report) {
  return (
   <div className="text-center py-16 text-surface-400">
    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
    <p>Hisobot yuklanmadi</p>
   </div>
  );
 }

 const lowStockProducts = report.stock?.filter((p) => p.isLowStock) || [];

 return (
  <div className="space-y-6">
   <div>
    <h1 className="text-2xl font-bold text-surface-100">Dashboard</h1>
    <p className="text-surface-400 text-sm mt-1">
     {report.date} kunlik hisobot • {report.timezone}
    </p>
   </div>

   {/* Stats grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
     icon={ShoppingCart}
     label="Bugungi savdo"
     value={`${formatUZS(report.sales.salesTotal)} so'm`}
     subtitle={`${report.sales.transactionCount} ta savdo`}
     iconBg="bg-primary-500/10"
     iconColor="text-primary-600 dark:text-primary-400"
     delay={0}
    />
    <StatCard
     icon={DollarSign}
     label="Tushum"
     value={`${formatUZS(report.sales.paidTotal)} so'm`}
     subtitle="Naqd tushum"
     iconBg="bg-success-500/10"
     iconColor="text-success-600 dark:text-success-400"
     delay={50}
    />
    <StatCard
     icon={CreditCard}
     label="Nasiya"
     value={`${formatUZS(report.sales.creditTotal)} so'm`}
     subtitle={`To'lovlar: ${formatUZS(report.debtCollections.totalAmount)}`}
     iconBg="bg-warning-500/10"
     iconColor="text-warning-600 dark:text-warning-400"
     delay={100}
    />
    <StatCard
     icon={Receipt}
     label="Harajatlar"
     value={`${formatUZS(report.expenses.totalAmount)} so'm`}
     subtitle={`${report.expenses.categories?.length || 0} kategoriya`}
     iconBg="bg-danger-500/10"
     iconColor="text-danger-600 dark:text-danger-400"
     delay={150}
    />
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Top products */}
    <div className="glass rounded-2xl p-5 animate-fade-in">
     <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-primary-500" />
      Eng ko'p sotilgan
     </h2>
     {report.topProducts?.length > 0 ? (
      <div className="space-y-3">
       {report.topProducts.slice(0, 5).map((product, i) => (
        <div
         key={product.productId || i}
         className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-colors"
        >
         <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 text-surface-200 text-xs font-bold flex items-center justify-center">
           {i + 1}
          </span>
          <span className="text-surface-200 font-medium">{product.name}</span>
         </div>
         <div className="text-right">
          <p className="text-surface-200 font-medium">{formatKg(product.quantityKg)}</p>
          <p className="text-xs text-surface-500">{formatUZS(product.revenue)} so'm</p>
         </div>
        </div>
       ))}
      </div>
     ) : (
      <p className="text-surface-500 text-center py-8">Bugun savdo yo'q</p>
     )}
    </div>

    {/* Low stock */}
    <div className="glass rounded-2xl p-5 animate-fade-in">
     <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-warning-400" />
      Kam qolgan yemlar
      {lowStockProducts.length > 0 && (
       <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning-500/20 text-warning-400">
        {lowStockProducts.length}
       </span>
      )}
     </h2>
     {lowStockProducts.length > 0 ? (
      <div className="space-y-2">
       {lowStockProducts.slice(0, 8).map((product) => {
        const percent = product.lowStockThresholdKg > 0
         ? Math.min((product.stockKg / product.lowStockThresholdKg) * 100, 100)
         : 0;
        return (
         <div key={product._id} className="p-3 rounded-xl bg-surface-800/30">
          <div className="flex justify-between items-center mb-2">
           <span className="text-surface-200 text-sm font-medium">{product.name}</span>
           <span className="text-xs text-surface-400">
            {formatKg(product.stockKg)} / {formatKg(product.lowStockThresholdKg)}
           </span>
          </div>
          <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
           <div
            className={`h-full rounded-full transition-all duration-500 ${
             percent < 30 ? 'bg-danger-500' : percent < 60 ? 'bg-warning-500' : 'bg-success-500'
            }`}
            style={{ width: `${percent}%` }}
           />
          </div>
         </div>
        );
       })}
      </div>
     ) : (
      <div className="text-center py-8">
       <Package className="w-10 h-10 text-success-500/40 mx-auto mb-2" />
       <p className="text-surface-500">Barcha yemlar yetarli</p>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
