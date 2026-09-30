import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';
import { formatUZS, formatKg, getErrorMessage } from '../utils';
import {
  Package, Plus, Search, Edit3, Trash2, X, AlertTriangle,
  TrendingUp, ArrowDownUp, CheckCircle2, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import Select from '../components/ui/Select';
import { CardSkeleton } from '../components/ui/Skeleton';

const CATEGORY_PRESETS = ["Bug'doy", "Arpa", "Makka", "Kepak", "Kombikorm", "Shulxa", "Premiks", "Soya", "Boshqa"];

function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    salePricePerKg: product?.salePricePerKg ?? '',
    purchasePricePerKg: product?.purchasePricePerKg ?? '',
    bagWeightKg: product?.bagWeightKg ?? '',
    lowStockThresholdKg: product?.lowStockThresholdKg ?? 2500,
  });
  const [saving, setSaving] = useState(false);

  // Live margin calculation
  const purchasePrice = Number(form.purchasePricePerKg) || 0;
  const salePrice = Number(form.salePricePerKg) || 0;
  const marginPerKg = salePrice - purchasePrice;
  const marginPercent = purchasePrice > 0 ? ((marginPerKg / purchasePrice) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Mahsulot nomini kiriting');

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        category: form.category.trim() || undefined,
        salePricePerKg: form.salePricePerKg === '' ? 0 : Number(form.salePricePerKg),
        purchasePricePerKg: form.purchasePricePerKg === '' ? 0 : Number(form.purchasePricePerKg),
        bagWeightKg: form.bagWeightKg === '' ? null : Number(form.bagWeightKg),
        lowStockThresholdKg: form.lowStockThresholdKg === '' ? 2500 : Number(form.lowStockThresholdKg),
      };

      if (isEdit) {
        await api.patch(`/products/${product._id}`, payload);
        toast.success('Mahsulot muvaffaqiyatli yangilandi');
      } else {
        await api.post('/products', payload);
        toast.success('Yangi mahsulot yaratildi');
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass rounded-2xl p-6 w-full max-w-xl animate-scale-in text-surface-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-700/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isEdit ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
              </h2>
              <p className="text-xs text-surface-400">Yem turi, narxlari va zaxira parametrlari</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name */}
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Mahsulot nomi *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masalan: Oq bug'doy 1-nav yoki Paxta shulxasi"
              className="w-full px-3.5 py-2.5 bg-surface-800/80 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              required
              autoFocus
            />
          </div>

          {/* Row 2: Category & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Kategoriya
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Tanlang yoki yozing"
                className="w-full px-3.5 py-2.5 bg-surface-800/80 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm"
              />
              <datalist id="category-suggestions">
                {CATEGORY_PRESETS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                SKU / Barkod (ixtiyoriy)
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                placeholder="Masalan: BGD-01"
                className="w-full px-3.5 py-2.5 bg-surface-800/80 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Row 3: Prices & Margin */}
          <div className="p-3.5 rounded-xl bg-surface-800/50 border border-surface-700/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                  Xarid narxi (so'm/kg)
                </label>
                <input
                  type="number"
                  value={form.purchasePricePerKg}
                  onChange={(e) => setForm({ ...form, purchasePricePerKg: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="any"
                  className="w-full px-3.5 py-2 bg-surface-900 border border-surface-700 rounded-xl text-surface-100 font-semibold focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                  Sotuv narxi (so'm/kg) *
                </label>
                <input
                  type="number"
                  value={form.salePricePerKg}
                  onChange={(e) => setForm({ ...form, salePricePerKg: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="any"
                  className="w-full px-3.5 py-2 bg-surface-900 border border-surface-700 rounded-xl text-surface-100 font-semibold focus:outline-none focus:border-primary-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Live Profit Margin indicator */}
            {salePrice > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-surface-700/40 text-xs">
                <span className="text-surface-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Kutilayotgan marja / foyda:
                </span>
                <span className={`font-bold px-2 py-0.5 rounded-md ${
                  marginPerKg >= 0
                    ? 'bg-success-500/10 text-success-600 dark:text-success-400'
                    : 'bg-danger-500/10 text-danger-500'
                }`}>
                  {marginPerKg >= 0 ? '+' : ''}{formatUZS(marginPerKg)} so'm/kg ({marginPercent}%)
                </span>
              </div>
            )}
          </div>

          {/* Row 4: Bag Weight & Low Stock Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Bitta qop vazni (kg)
              </label>
              <input
                type="number"
                value={form.bagWeightKg}
                onChange={(e) => setForm({ ...form, bagWeightKg: e.target.value })}
                placeholder="Masalan: 50"
                min="0.1"
                step="any"
                className="w-full px-3.5 py-2.5 bg-surface-800/80 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm"
              />
              <span className="text-[10px] text-surface-400 mt-1 block">
                POS savdoda "qop" birligida tez sotish imkonini beradi
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Kam qoldiq chegarasi (kg)
              </label>
              <input
                type="number"
                value={form.lowStockThresholdKg}
                onChange={(e) => setForm({ ...form, lowStockThresholdKg: e.target.value })}
                placeholder="2500"
                min="0"
                step="any"
                className="w-full px-3.5 py-2.5 bg-surface-800/80 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm"
              />
              <span className="text-[10px] text-surface-400 mt-1 block">
                Zaxira shu miqdordan kamaysa, ogohlantirish beriladi
              </span>
            </div>
          </div>

          {/* Business rule info note */}
          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15 text-xs text-surface-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
            <span>
              Xavfsizlik va aniq audit uchun mahsulot qoldig'i (kg) faqat omborga <strong>Kirim</strong> yoki kassadagi <strong>Savdo</strong> tranzaksiyalari orqali avtomatik o'zgaradi.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3 border-t border-surface-700/60">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-surface-700 text-surface-300 hover:bg-surface-800 transition-colors text-sm font-medium"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-all shadow-sm text-sm"
            >
              {saving ? 'Saqlanmoqda...' : isEdit ? 'O\'zgarishlarni saqlash' : 'Mahsulotni yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [modalProduct, setModalProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (lowStockOnly) params.lowStock = 'true';
      const res = await api.get('/products', { params });
      setProducts(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, lowStockOnly]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filter and sort
  const displayedProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      return true;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stockAsc') return a.stockKg - b.stockKg;
      if (sortBy === 'stockDesc') return b.stockKg - a.stockKg;
      if (sortBy === 'priceDesc') return b.salePricePerKg - a.salePricePerKg;
      if (sortBy === 'priceAsc') return a.salePricePerKg - b.salePricePerKg;
      return 0;
    });
  }, [products, selectedCategory, sortBy]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stockKg <= p.lowStockThresholdKg).length;
  }, [products]);

  const handleDelete = async (product) => {
    if (!window.confirm(`"${product.name}" mahsulotini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      toast.success('Mahsulot o\'chirildi');
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-surface-100">
            <Package className="w-6 h-6 text-primary-500" />
            Yem Mahsulotlari
          </h1>
          <p className="text-xs text-surface-400 mt-0.5">
            Do'kondagi barcha yemlar narxi, qop vazni va ombor zaxira nazorati
          </p>
        </div>
        <button
          onClick={() => { setModalProduct(null); setShowModal(true); }}
          id="add-product-button"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-sm text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yangi mahsulot qo'shish
        </button>
      </div>

      {/* Search & Action Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi yoki SKU bo'yicha qidirish..."
            id="product-search"
            className="w-full pl-10 pr-9 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 text-sm shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Low Stock Toggle Button */}
        <button
          type="button"
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            lowStockOnly
              ? 'border-warning-500 bg-warning-500/15 text-warning-500 shadow-sm'
              : 'border-surface-700 bg-surface-900 text-surface-400 hover:border-surface-600 hover:text-surface-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Kam qolganlar
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-warning-500 text-white text-[10px] font-bold">
              {lowStockCount}
            </span>
          )}
        </button>

        {/* Sort select */}
        <div className="w-56 shrink-0">
          <Select
            options={[
              { value: 'name', label: 'Nomi (A-Z)' },
              { value: 'stockAsc', label: 'Qoldiq (Kam qolganlar)' },
              { value: 'stockDesc', label: 'Qoldiq (Ko\'p qolganlar)' },
              { value: 'priceDesc', label: 'Narx (Qimmatdan)' },
              { value: 'priceAsc', label: 'Narx (Arzondan)' },
            ]}
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            searchable={false}
            size="sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-surface-900 border border-surface-700 text-surface-400 hover:text-surface-200 hover:bg-surface-800'
            }`}
          >
            Barcha kategoriyalar ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-surface-900 border border-surface-700 text-surface-400 hover:text-surface-200 hover:bg-surface-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <CardSkeleton count={6} className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3" />
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-16 bg-surface-900 border border-surface-700 rounded-2xl p-6">
          <Package className="w-12 h-12 mx-auto mb-3 text-surface-400/40" />
          <h3 className="font-semibold text-surface-200">Mahsulot topilmadi</h3>
          <p className="text-xs text-surface-400 mt-1">Qidiruv parametrlarini o'zgartirib ko'ring yoki yangi mahsulot qo'shing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedProducts.map((product) => {
            const isLow = product.stockKg <= product.lowStockThresholdKg;
            const isOut = product.stockKg <= 0;
            const margin = product.salePricePerKg - (product.purchasePricePerKg || 0);

            // Stock progress percentage
            const stockPercent = product.lowStockThresholdKg > 0
              ? Math.min((product.stockKg / product.lowStockThresholdKg) * 100, 100)
              : 100;

            return (
              <div
                key={product._id}
                className="bg-surface-900 border border-surface-700 rounded-2xl p-4 hover:border-primary-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top card bar: category & actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold text-surface-400 px-2 py-0.5 rounded-md bg-surface-800 border border-surface-700">
                        {product.category || 'Umumiy'}
                      </span>
                      {product.sku && (
                        <span className="ml-2 text-[11px] text-surface-400 font-mono">
                          {product.sku}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setModalProduct(product); setShowModal(true); }}
                        title="Tahrirlash"
                        className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-primary-500 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        title="O'chirish"
                        className="p-1.5 rounded-lg hover:bg-danger-500/10 text-surface-400 hover:text-danger-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-surface-100 text-base leading-snug mb-3">
                    {product.name}
                  </h3>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Sotuv narxi */}
                    <div className="p-2.5 rounded-xl bg-surface-800/70 border border-surface-700/60">
                      <p className="text-surface-400 text-[11px]">Sotuv narxi</p>
                      <p className="text-primary-600 dark:text-primary-400 font-bold text-sm mt-0.5">
                        {formatUZS(product.salePricePerKg)} so'm/kg
                      </p>
                    </div>

                    {/* Xarid narxi & Margin */}
                    <div className="p-2.5 rounded-xl bg-surface-800/70 border border-surface-700/60">
                      <p className="text-surface-400 text-[11px]">Xarid narxi</p>
                      <p className="font-bold text-surface-200 text-sm mt-0.5">
                        {formatUZS(product.purchasePricePerKg)} so'm/kg
                      </p>
                    </div>

                    {/* Qop vazni */}
                    <div className="p-2.5 rounded-xl bg-surface-800/70 border border-surface-700/60">
                      <p className="text-surface-400 text-[11px]">Qop vazni</p>
                      <p className="font-semibold text-surface-200 mt-0.5">
                        {product.bagWeightKg ? `${product.bagWeightKg} kg` : 'Belgilanmagan'}
                      </p>
                    </div>

                    {/* Marja */}
                    <div className="p-2.5 rounded-xl bg-surface-800/70 border border-surface-700/60">
                      <p className="text-surface-400 text-[11px]">Sof foyda (marja)</p>
                      <p className={`font-semibold mt-0.5 ${
                        margin >= 0 ? 'text-success-500' : 'text-danger-500'
                      }`}>
                        {margin >= 0 ? '+' : ''}{formatUZS(margin)} so'm/kg
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stock Progress & Badge */}
                <div className="pt-3 border-t border-surface-700/60 mt-3 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-surface-400">Ombor qoldig'i:</span>
                    <span className={`font-bold ${
                      isOut ? 'text-danger-500' : isLow ? 'text-warning-500' : 'text-success-600 dark:text-success-400'
                    }`}>
                      {formatKg(product.stockKg)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOut ? 'bg-danger-500' : isLow ? 'bg-warning-500' : 'bg-success-500'
                      }`}
                      style={{ width: `${isOut ? 100 : Math.max(5, stockPercent)}%` }}
                    />
                  </div>

                  {isLow && (
                    <p className="text-[11px] text-warning-500 flex items-center gap-1 font-medium pt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Kam qolgan (chegara: {formatKg(product.lowStockThresholdKg)})
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <ProductModal
          product={modalProduct}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}
