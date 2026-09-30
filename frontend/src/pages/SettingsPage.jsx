import { useState, useEffect } from 'react';
import api from '../api';
import { getErrorMessage } from '../utils';
import { Settings, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select } from '../components/ui/Select';
import { Skeleton, FormSkeleton } from '../components/ui/Skeleton';

export default function SettingsPage() {
 const [settings, setSettings] = useState(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [form, setForm] = useState({});
 const [telegramToken, setTelegramToken] = useState('');
 const [showTokenField, setShowTokenField] = useState(false);

 useEffect(() => {
  api.get('/settings')
   .then((res) => {
    const data = res.data.data;
    setSettings(data);
    setForm({
     businessName: data.businessName || '',
     currency: data.currency || 'UZS',
     timezone: data.timezone || 'Asia/Tashkent',
     defaultLowStockThresholdKg: data.defaultLowStockThresholdKg ?? 2500,
     telegramEnabled: data.telegramEnabled || false,
     telegramAdminChatId: data.telegramAdminChatId || '',
     dailyReportEnabled: data.dailyReportEnabled ?? true,
     dailyReportTime: data.dailyReportTime || '21:00',
    });
   })
   .catch((err) => toast.error(getErrorMessage(err)))
   .finally(() => setLoading(false));
 }, []);

 const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);
  try {
   const payload = {
    ...form,
    defaultLowStockThresholdKg: Number(form.defaultLowStockThresholdKg),
   };

   // Only include telegram token if user explicitly entered one
   if (telegramToken.trim()) {
    payload.telegramBotToken = telegramToken.trim();
   }

   const res = await api.patch('/settings', payload);
   setSettings(res.data.data);
   setTelegramToken('');
   setShowTokenField(false);
   toast.success('Sozlamalar saqlandi');
  } catch (err) {
   toast.error(getErrorMessage(err));
  } finally {
   setSaving(false);
  }
 };

 if (loading) {
  return (
   <div className="space-y-6 max-w-2xl animate-fade-in">
    <div className="flex items-center gap-2">
     <Skeleton className="w-6 h-6 rounded-lg" />
     <Skeleton className="h-7 w-40 rounded-xl" />
    </div>
    <div className="glass rounded-2xl p-6 space-y-4">
     <Skeleton className="h-5 w-28 rounded-lg mb-4" />
     <FormSkeleton fields={3} />
    </div>
    <div className="glass rounded-2xl p-6 space-y-4">
     <Skeleton className="h-5 w-36 rounded-lg mb-4" />
     <FormSkeleton fields={3} />
    </div>
   </div>
  );
 }

 return (
  <div className="space-y-6 max-w-2xl">
   <h1 className="text-2xl font-bold flex items-center gap-2">
    <Settings className="w-6 h-6 text-primary-400" />
    Sozlamalar
   </h1>

   <form onSubmit={handleSave} className="space-y-6">
    {/* General */}
    <div className="glass rounded-2xl p-6 space-y-4">
     <h2 className="text-lg font-semibold border-b border-surface-700/50 pb-3">Umumiy</h2>
     <div>
      <label className="text-sm text-surface-400 mb-1 block">Biznes nomi</label>
      <input
       type="text"
       value={form.businessName}
       onChange={(e) => setForm({ ...form, businessName: e.target.value })}
       placeholder="Yem do'koni"
       className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
      />
     </div>
     <div className="grid grid-cols-2 gap-4">
      <div>
       <label className="text-sm text-surface-400 mb-1 block">Valyuta</label>
       <input
        type="text"
        value={form.currency}
        onChange={(e) => setForm({ ...form, currency: e.target.value })}
        maxLength={3}
        className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 focus:outline-none focus:border-primary-500"
       />
      </div>
      <div>
       <label className="text-sm text-surface-400 mb-1 block">Timezone</label>
       <Select
        options={[
         { value: 'Asia/Tashkent', label: "Asia/Tashkent (UTC+5)" },
         { value: 'Asia/Samarkand', label: "Asia/Samarkand (UTC+5)" },
        ]}
        value={form.timezone}
        onChange={(val) => setForm({ ...form, timezone: val })}
        searchable={false}
       />
      </div>
     </div>
     <div>
      <label className="text-sm text-surface-400 mb-1 block">Kam qoldiq chegarasi (kg)</label>
      <input
       type="number"
       value={form.defaultLowStockThresholdKg}
       onChange={(e) => setForm({ ...form, defaultLowStockThresholdKg: e.target.value })}
       min={0}
       className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 focus:outline-none focus:border-primary-500"
      />
     </div>
    </div>

    {/* Telegram */}
    <div className="glass rounded-2xl p-6 space-y-4">
     <h2 className="text-lg font-semibold border-b border-surface-700/50 pb-3">Telegram hisobot</h2>

     <div className="flex items-center justify-between">
      <div>
       <p className="text-surface-200 font-medium">Telegram bot</p>
       <p className="text-xs text-surface-500">Kundalik hisobot yuborish</p>
      </div>
      <button
       type="button"
       onClick={() => setForm({ ...form, telegramEnabled: !form.telegramEnabled })}
       className={`w-12 h-6 rounded-full transition-all duration-200 ${
        form.telegramEnabled ? 'bg-primary-600' : 'bg-surface-600'
       }`}
      >
       <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        form.telegramEnabled ? 'translate-x-6' : 'translate-x-0.5'
       }`} />
      </button>
     </div>

     {form.telegramEnabled && (
      <div className="space-y-4 animate-slide-in">
       <div>
        <label className="text-sm text-surface-400 mb-1 block">Admin Chat ID</label>
        <input
         type="text"
         value={form.telegramAdminChatId}
         onChange={(e) => setForm({ ...form, telegramAdminChatId: e.target.value })}
         placeholder="123456789"
         className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
        />
       </div>

       <div>
        <div className="flex items-center justify-between mb-1">
         <label className="text-sm text-surface-400">Bot Token</label>
         <button
          type="button"
          onClick={() => setShowTokenField(!showTokenField)}
          className="text-xs text-primary-400 hover:underline flex items-center gap-1"
         >
          {showTokenField ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showTokenField ? 'Yashirish' : 'O\'zgartirish'}
         </button>
        </div>
        {showTokenField ? (
         <input
          type="password"
          value={telegramToken}
          onChange={(e) => setTelegramToken(e.target.value)}
          placeholder="Yangi tokenni kiriting"
          className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
         />
        ) : (
         <p className="text-xs text-surface-500 px-3.5 py-2.5 bg-surface-800/30 rounded-xl">
          Token xavfsizlik uchun ko'rsatilmaydi. O'zgartirish uchun yuqoridagi tugmani bosing.
         </p>
        )}
       </div>

       <div className="flex items-center justify-between">
        <div>
         <p className="text-surface-200 text-sm">Kundalik hisobot</p>
        </div>
        <button
         type="button"
         onClick={() => setForm({ ...form, dailyReportEnabled: !form.dailyReportEnabled })}
         className={`w-12 h-6 rounded-full transition-all duration-200 ${
          form.dailyReportEnabled ? 'bg-primary-600' : 'bg-surface-600'
         }`}
        >
         <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          form.dailyReportEnabled ? 'translate-x-6' : 'translate-x-0.5'
         }`} />
        </button>
       </div>

       {form.dailyReportEnabled && (
        <div>
         <label className="text-sm text-surface-400 mb-1 block">Hisobot vaqti</label>
         <input
          type="time"
          value={form.dailyReportTime}
          onChange={(e) => setForm({ ...form, dailyReportTime: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 focus:outline-none focus:border-primary-500"
         />
        </div>
       )}
      </div>
     )}
    </div>

    <button
     type="submit"
     disabled={saving}
     id="settings-save"
     className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-all shadow-sm"
    >
     <Save className="w-4 h-4" />
     {saving ? 'Saqlanmoqda...' : 'Saqlash'}
    </button>
   </form>
  </div>
 );
}
