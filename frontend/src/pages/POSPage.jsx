import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../api';
import { formatUZS, formatKg, getErrorMessage, formatDateTime } from '../utils';
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign,
  X, Printer, CheckCircle2, AlertTriangle, Search, Clock,
  User, Phone, ChevronDown, ChevronUp, Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from '../components/ui/DatePicker';
import { CardSkeleton } from '../components/ui/Skeleton';

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass rounded-2xl p-6 w-full max-w-md animate-scale-in text-surface-100 shadow-2xl print:bg-white print:text-black print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center pb-4 border-b border-surface-700/60 print:border-gray-300">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-sm print:hidden">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold">BOG'ISHAMOL</h2>
          <p className="text-xs text-surface-400 print:text-gray-500 mt-0.5">Yemxona Kassa Cheki</p>
          <p className="text-xs text-surface-400 print:text-gray-500 mt-1">
            {formatDateTime(receipt.date)}
          </p>
        </div>

        {receipt.customerName && (
          <div className="py-2.5 border-b border-surface-700/60 print:border-gray-300 text-xs flex justify-between">
            <span className="text-surface-400 print:text-gray-500">Mijoz:</span>
            <span className="font-semibold text-surface-200 print:text-black">
              {receipt.customerName} {receipt.customerPhone ? `(${receipt.customerPhone})` : ''}
            </span>
          </div>
        )}

        <div className="py-3 border-b border-surface-700/60 print:border-gray-300 max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-surface-400 print:text-gray-600 border-b border-surface-700/40 pb-1">
                <th className="text-left font-medium pb-1">Nomi</th>
                <th className="text-center font-medium pb-1">Miqdor</th>
                <th className="text-right font-medium pb-1">Narx/kg</th>
                <th className="text-right font-medium pb-1">Jami</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/40 print:divide-gray-200">
              {receipt.items.map((item, idx) => {
                const qtyStr = `${item.inputQuantity} ${item.inputUnit === 'bag' ? 'qop' : item.inputUnit === 'ton' ? 'ton' : 'kg'}`;
                return (
                  <tr key={idx} className="py-1">
                    <td className="py-1 font-medium">{item.productName}</td>
                    <td className="py-1 text-center text-surface-300 print:text-gray-700">{qtyStr}</td>
                    <td className="py-1 text-right text-surface-400 print:text-gray-600">{formatUZS(item.unitPricePerKg)}</td>
                    <td className="py-1 text-right font-semibold text-surface-200 print:text-black">{formatUZS(item.lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="py-3 space-y-1.5 text-xs border-b border-surface-700/60 print:border-gray-300">
          <div className="flex justify-between text-sm font-bold pt-1">
            <span>To'lov summasi:</span>
            <span className="text-primary-600 dark:text-primary-400 print:text-black text-base">{formatUZS(receipt.totalAmount)} so'm</span>
          </div>

          <div className="flex justify-between text-surface-400 print:text-gray-600">
            <span>To'lov turi:</span>
            <span className="font-semibold uppercase text-surface-200 print:text-black">
              {receipt.paymentMethod === 'cash' ? 'Naqd' : receipt.paymentMethod === 'card' ? 'Karta' : 'Nasiya'}
            </span>
          </div>

          {receipt.paymentMethod === 'cash' && receipt.tenderedAmount > 0 && (
            <>
              <div className="flex justify-between text-surface-400 print:text-gray-600">
                <span>Qabul qilingan naqd:</span>
                <span>{formatUZS(receipt.tenderedAmount)} so'm</span>
              </div>
              <div className="flex justify-between font-bold text-success-600 dark:text-success-400 print:text-black text-sm pt-1">
                <span>Qaytim:</span>
                <span>{formatUZS(receipt.changeAmount)} so'm</span>
              </div>
            </>
          )}

          {receipt.paymentMethod === 'credit' && (
            <>
              <div className="flex justify-between text-surface-400 print:text-gray-600">
                <span>Boshlang'ich to'lov:</span>
                <span>{formatUZS(receipt.paidAmount)} so'm</span>
              </div>
              <div className="flex justify-between font-bold text-warning-500 print:text-black">
                <span>Nasiya qarzi:</span>
                <span>{formatUZS(receipt.totalAmount - receipt.paidAmount)} so'm</span>
              </div>
              {receipt.dueDate && (
                <div className="flex justify-between text-surface-400 print:text-gray-600">
                  <span>To'lash muddati:</span>
                  <span>{receipt.dueDate}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-center py-2 text-[11px] text-surface-500 print:text-gray-500">
          Xaridingiz uchun rahmat! Yana kutamiz.
        </div>

        <div className="flex gap-3 pt-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl border border-surface-700 bg-surface-800 text-surface-200 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Chop etish
          </button>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            Yangi savdo (Enter)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment method: 'cash' | 'card' | 'credit'
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Customer info
  const [showCustomerSection, setShowCustomerSection] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');



  // Cashier inputs
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState(''); // For credit down payment
  const [dueDate, setDueDate] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);

  // Price edit in cart
  const [editingPriceId, setEditingPriceId] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data.data.filter((p) => p.isActive)))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Quick keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && lastReceipt) {
        setLastReceipt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastReceipt]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const addToCart = (product, unit = 'kg', qty = 1) => {
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing) {
      setCart(cart.map((item) =>
        item.product._id === product._id
          ? { ...item, inputQuantity: Number((Number(item.inputQuantity) + qty).toFixed(2)) }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        inputQuantity: qty,
        inputUnit: unit,
        unitPricePerKg: product.salePricePerKg,
      }]);
    }
  };

  const updateCartItem = (productId, updates) => {
    setCart(cart.map((item) =>
      item.product._id === productId ? { ...item, ...updates } : item
    ));
  };

  const incrementQty = (productId, delta) => {
    setCart(cart.map((item) => {
      if (item.product._id === productId) {
        const nextQty = Math.max(0.1, Number(item.inputQuantity) + delta);
        return { ...item, inputQuantity: Number(nextQty.toFixed(2)) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setTenderedAmount('');
    setEditingPriceId(null);
  };

  const getItemKg = (item) => {
    const qty = Number(item.inputQuantity) || 0;
    if (item.inputUnit === 'ton') return qty * 1000;
    if (item.inputUnit === 'bag') return qty * (item.product.bagWeightKg || 0);
    return qty;
  };

  const getItemLineTotal = (item) => {
    return getItemKg(item) * (Number(item.unitPricePerKg) || 0);
  };

  // Cart Total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + getItemLineTotal(item), 0);
  }, [cart]);

  // Check if any cart item exceeds stock
  const stockExceededItem = useMemo(() => {
    return cart.find((item) => getItemKg(item) > (item.product.stockKg || 0));
  }, [cart]);

  const isCredit = paymentMethod === 'credit';
  const actualPaid = isCredit ? (Number(paidAmount) || 0) : cartTotal;

  // Tendered & Change calculation
  const parsedTendered = Number(tenderedAmount) || 0;
  const changeAmount = paymentMethod === 'cash' && parsedTendered >= cartTotal && cartTotal > 0
    ? parsedTendered - cartTotal
    : 0;

  // Smart dynamic cash buttons based on cartTotal
  const quickCashOptions = useMemo(() => {
    if (cartTotal <= 0) return [];
    const options = new Set();
    options.add(cartTotal); // Exact total

    // Round up to nearest 10,000
    if (cartTotal % 10000 !== 0) {
      options.add(Math.ceil(cartTotal / 10000) * 10000);
    }
    // Round up to nearest 50,000
    if (cartTotal % 50000 !== 0) {
      options.add(Math.ceil(cartTotal / 50000) * 50000);
    }
    // Round up to nearest 100,000
    if (cartTotal % 100000 !== 0) {
      options.add(Math.ceil(cartTotal / 100000) * 100000);
    }
    // Standard major bank bills
    [50000, 100000, 200000, 500000].forEach((bill) => {
      if (bill >= cartTotal) options.add(bill);
    });

    return Array.from(options).sort((a, b) => a - b).slice(0, 5);
  }, [cartTotal]);

  const addCashAmount = (delta) => {
    const current = Number(tenderedAmount) || 0;
    setTenderedAmount(String(current + delta));
  };

  // Quick Due Date helpers
  const handleQuickDays = (days) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setDueDate(target.toISOString().split('T')[0]);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return toast.error('Savatcha bo\'sh');
    if (stockExceededItem) {
      return toast.error(`"${stockExceededItem.product.name}" uchun zaxira yetarli emas!`);
    }
    if (isCredit && !customerName.trim()) return toast.error('Nasiya uchun mijoz ismi shart');
    if (isCredit && !dueDate) return toast.error('Nasiya uchun qaytarish muddati shart');

    setSubmitting(true);
    try {
      const itemsPayload = cart.map((item) => ({
        product: item.product._id,
        inputQuantity: Number(item.inputQuantity),
        inputUnit: item.inputUnit,
        unitPricePerKg: Number(item.unitPricePerKg),
      }));

      const payload = {
        type: 'sale',
        items: itemsPayload,
        paymentMethod,
        paidAmount: actualPaid,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        dueDate: isCredit ? dueDate : undefined,
      };

      await api.post('/transactions', payload);
      toast.success('Savdo muvaffaqiyatli yakunlandi!');

      // Save receipt details for receipt modal
      const receiptData = {
        date: new Date().toISOString(),
        items: cart.map((item) => ({
          productName: item.product.name,
          inputQuantity: item.inputQuantity,
          inputUnit: item.inputUnit,
          unitPricePerKg: item.unitPricePerKg,
          lineTotal: getItemLineTotal(item),
        })),
        totalAmount: cartTotal,
        paymentMethod,
        paidAmount: actualPaid,
        tenderedAmount: parsedTendered,
        changeAmount,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        dueDate,
      };
      setLastReceipt(receiptData);

      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDueDate('');
      setPaidAmount('');
      setTenderedAmount('');
      setPaymentMethod('cash');
      setShowCustomerSection(false);

      // Refresh product stock
      const prodRes = await api.get('/products');
      setProducts(prodRes.data.data.filter((p) => p.isActive));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-surface-100">
            <ShoppingCart className="w-6 h-6 text-primary-500" />
            Bog'ishamol POS Kassasi
          </h1>
          <p className="text-xs text-surface-400 mt-0.5">Tezkor savdo, kassa, mijoz va qaytim hisoblagichi</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger-500/20 text-danger-500 hover:bg-danger-500/10 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Savatni tozalash
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mahsulot yoki SKU qidirish... (Tezkor bosish: /)"
              id="pos-search"
              className="w-full pl-10 pr-9 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm shadow-sm transition-all"
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

          {/* Category tabs */}
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
                Barchasi ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <CardSkeleton count={6} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-surface-900 border border-surface-700 rounded-2xl p-6">
              <ShoppingCart className="w-10 h-10 text-surface-400/40 mx-auto mb-2" />
              <p className="text-surface-400 text-sm">Mos mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const isOutOfStock = (product.stockKg || 0) <= 0;
                const isLowStock = !isOutOfStock && product.stockKg <= product.lowStockThresholdKg;

                return (
                  <div
                    key={product._id}
                    className={`group relative bg-surface-900 border rounded-2xl p-3.5 transition-all duration-200 flex flex-col justify-between ${
                      isOutOfStock
                        ? 'border-surface-700/60 opacity-60'
                        : 'border-surface-700 hover:border-primary-500/60 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-semibold text-surface-400 truncate">
                          {product.category || 'Yem'}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-danger-500/10 text-danger-500">
                            Tugagan
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-warning-500/10 text-warning-500">
                            Kam qoldi
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-success-500/10 text-success-500">
                            Yetarli
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-surface-100 text-sm leading-snug line-clamp-2">
                        {product.name}
                      </h3>

                      <p className="text-primary-600 dark:text-primary-400 font-extrabold text-base mt-1.5">
                        {formatUZS(product.salePricePerKg)} <span className="text-xs font-normal text-surface-400">so'm/kg</span>
                      </p>

                      <p className="text-[11px] text-surface-400 mt-0.5">
                        Qoldiq: <span className="font-semibold text-surface-200">{formatKg(product.stockKg)}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-surface-700/40 mt-3 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => addToCart(product, 'kg', 1)}
                        disabled={isOutOfStock}
                        title="1 kg qo'shish"
                        className="flex-1 py-1.5 px-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs flex items-center justify-center gap-1 disabled:opacity-40 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        +1 kg
                      </button>

                      {product.bagWeightKg ? (
                        <button
                          type="button"
                          onClick={() => addToCart(product, 'bag', 1)}
                          disabled={isOutOfStock}
                          title={`1 Qop (${product.bagWeightKg} kg)`}
                          className="py-1.5 px-2.5 rounded-xl border border-primary-500/40 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs hover:bg-primary-500/20 disabled:opacity-40 transition-colors whitespace-nowrap"
                        >
                          +1 Qop
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(product, 'kg', 10)}
                          disabled={isOutOfStock}
                          title="10 kg qo'shish"
                          className="py-1.5 px-2 rounded-xl border border-surface-700 bg-surface-800 text-surface-300 font-semibold text-xs hover:text-surface-100 hover:bg-surface-700 disabled:opacity-40 transition-colors"
                        >
                          +10 kg
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Upgraded Cart & Checkout Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-4 shadow-sm sticky top-4 space-y-3.5">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-700">
              <div className="flex items-center gap-2">
                <span className="font-bold text-surface-100 text-base">Savatcha</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 font-bold">
                  {cart.length} ta
                </span>
              </div>
              <span className="text-xs text-surface-400">
                Summa: <strong className="text-surface-100 text-sm">{formatUZS(cartTotal)} so'm</strong>
              </span>
            </div>

            {/* Stock Exceeded Warning */}
            {stockExceededItem && (
              <div className="p-2.5 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{stockExceededItem.product.name}</strong> ombor qoldig'idan oshib ketdi!
                </span>
              </div>
            )}

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="text-center py-10 px-4">
                <ShoppingCart className="w-10 h-10 text-surface-400/30 mx-auto mb-2" />
                <p className="text-surface-400 text-xs">Savatcha bo'sh. Mahsulot qo'shish uchun chap paneldan tanlang.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[28vh] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const lineKg = getItemKg(item);
                  const isOver = lineKg > (item.product.stockKg || 0);
                  const isEditingPrice = editingPriceId === item.product._id;

                  return (
                    <div
                      key={item.product._id}
                      className={`p-3 rounded-xl border transition-all ${
                        isOver
                          ? 'bg-danger-500/5 border-danger-500/30'
                          : 'bg-surface-800/60 border-surface-700/60'
                      }`}
                    >
                      {/* Item top row: Name, price editor toggle, delete */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-surface-100 truncate flex-1">
                          {item.product.name}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Price edit toggle */}
                          <button
                            type="button"
                            onClick={() => setEditingPriceId(isEditingPrice ? null : item.product._id)}
                            className={`p-1 rounded text-xs transition-colors ${
                              isEditingPrice
                                ? 'bg-primary-500 text-white'
                                : 'text-surface-400 hover:text-primary-500 hover:bg-surface-700'
                            }`}
                            title="Narxni o'zgartirish"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          {/* Delete item */}
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="p-1 rounded text-surface-400 hover:text-danger-500 hover:bg-danger-500/10 transition-colors"
                            title="O'chirish"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Custom price input if editing */}
                      {isEditingPrice && (
                        <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-surface-900 border border-primary-500/40">
                          <label className="text-[11px] text-surface-400 whitespace-nowrap">Maxsus narx (kg):</label>
                          <input
                            type="number"
                            value={item.unitPricePerKg}
                            onChange={(e) => updateCartItem(item.product._id, { unitPricePerKg: e.target.value })}
                            className="w-full px-2 py-0.5 bg-surface-800 border border-surface-700 rounded text-xs font-bold text-surface-100 focus:outline-none focus:border-primary-500"
                            min="0"
                            step="any"
                          />
                          <span className="text-[11px] text-surface-400">so'm</span>
                        </div>
                      )}

                      {/* Item bottom row: Quantity controls, unit selector, subtotal */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Quantity Counter with +/- buttons */}
                        <div className="flex items-center rounded-lg border border-surface-700 bg-surface-900 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => incrementQty(item.product._id, -1)}
                            className="p-1.5 hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            value={item.inputQuantity}
                            onChange={(e) => updateCartItem(item.product._id, { inputQuantity: e.target.value })}
                            className="w-14 px-1 py-1 bg-transparent text-center text-xs font-bold text-surface-100 focus:outline-none"
                            min="0.1"
                            step="any"
                          />
                          <button
                            type="button"
                            onClick={() => incrementQty(item.product._id, 1)}
                            className="p-1.5 hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Unit selector buttons */}
                        <div className="flex bg-surface-900 border border-surface-700/80 rounded-lg p-0.5 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => updateCartItem(item.product._id, { inputUnit: 'kg' })}
                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                              item.inputUnit === 'kg'
                                ? 'bg-primary-600 text-white font-bold shadow-sm'
                                : 'text-surface-400 hover:text-surface-200'
                            }`}
                          >
                            kg
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCartItem(item.product._id, { inputUnit: 'ton' })}
                            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                              item.inputUnit === 'ton'
                                ? 'bg-primary-600 text-white font-bold shadow-sm'
                                : 'text-surface-400 hover:text-surface-200'
                            }`}
                          >
                            tonna
                          </button>
                          {item.product.bagWeightKg && (
                            <button
                              type="button"
                              onClick={() => updateCartItem(item.product._id, { inputUnit: 'bag' })}
                              className={`px-2 py-1 rounded-md text-xs transition-colors ${
                                item.inputUnit === 'bag'
                                  ? 'bg-primary-600 text-white font-bold shadow-sm'
                                  : 'text-surface-400 hover:text-surface-200'
                              }`}
                            >
                              qop ({item.product.bagWeightKg}kg)
                            </button>
                          )}
                        </div>

                        {/* Subtotal */}
                        <div className="text-right ml-auto">
                          <p className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
                            {formatUZS(getItemLineTotal(item))} so'm
                          </p>
                          <p className="text-[10px] text-surface-400">
                            ({formatKg(lineKg)})
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}



            {/* MIJOZ (Customer) Section */}
            {cart.length > 0 && (
              <div className="rounded-xl border border-surface-700/60 bg-surface-800/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCustomerSection(!showCustomerSection)}
                  className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-surface-300 hover:bg-surface-800 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-500" />
                    Mijoz ma'lumotlari {isCredit ? '*' : '(ixtiyoriy)'}
                  </span>
                  <div className="flex items-center gap-1 text-surface-400">
                    {customerName && <span className="font-semibold text-primary-500 text-[11px] truncate max-w-[120px]">{customerName}</span>}
                    {showCustomerSection || isCredit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {(showCustomerSection || isCredit) && (
                  <div className="p-3 border-t border-surface-700/60 space-y-2 bg-surface-900/60 animate-slide-in">
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Mijoz ismi va familiyasi"
                        className="w-full pl-8 pr-3 py-1.5 bg-surface-900 border border-surface-700 rounded-lg text-xs font-medium text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
                        required={isCredit}
                      />
                    </div>

                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Telefon raqami (masalan: 90 123 45 67)"
                        className="w-full pl-8 pr-3 py-1.5 bg-surface-900 border border-surface-700 rounded-lg text-xs font-medium text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    {isCredit && (
                      <div className="pt-1 space-y-2 border-t border-surface-700/40">
                        <input
                          type="number"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          placeholder="Boshlang'ich to'lov (so'm, ixtiyoriy)"
                          className="w-full px-3 py-1.5 bg-surface-900 border border-surface-700 rounded-lg text-xs font-medium text-surface-100 placeholder-surface-500 focus:outline-none focus:border-warning-500"
                          min="0"
                          step="any"
                        />

                        <div>
                          <label className="text-[11px] font-semibold text-surface-400 mb-1 block">To'lash muddati *</label>
                          <DatePicker
                            value={dueDate}
                            onChange={(val) => setDueDate(val)}
                            placeholder="Sanani tanlang"
                            minDate={new Date().toISOString().split('T')[0]}
                            size="sm"
                          />
                          <div className="flex gap-1.5 mt-1.5">
                            {[7, 15, 30].map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => handleQuickDays(days)}
                                className="flex-1 py-1 rounded-md text-[10px] font-bold bg-surface-900 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700 transition-colors"
                              >
                                +{days} kun
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TO'LOV TURLARI VA SUMMA */}
            <div className="pt-2 border-t border-surface-700 space-y-3">
              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-surface-400 mb-1.5 block">To'lov usuli</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Naqd', icon: DollarSign },
                    { value: 'card', label: 'Karta', icon: CreditCard },
                    { value: 'credit', label: 'Nasiya', icon: Clock },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(value);
                        if (value === 'credit') setShowCustomerSection(true);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        paymentMethod === value
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Quick Tender & Change Calculator */}
              {paymentMethod === 'cash' && cart.length > 0 && (
                <div className="p-3 rounded-xl bg-surface-800/70 border border-surface-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-surface-300">Mijoz bergan summa:</label>
                    <button
                      type="button"
                      onClick={() => setTenderedAmount(String(cartTotal))}
                      className="text-[11px] font-extrabold text-primary-500 hover:underline"
                    >
                      Aniq summa ({formatUZS(cartTotal)})
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-sm font-extrabold text-surface-100 focus:outline-none focus:border-primary-500"
                    />
                    {tenderedAmount && (
                      <button
                        type="button"
                        onClick={() => setTenderedAmount('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dynamic Cash presets based on cartTotal */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      {quickCashOptions.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTenderedAmount(String(amt))}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                            parsedTendered === amt
                              ? 'bg-primary-500 text-white'
                              : 'bg-surface-900 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700'
                          }`}
                        >
                          {formatUZS(amt)}
                        </button>
                      ))}
                    </div>

                    {/* Quick additions (+10k, +50k, +100k) */}
                    <div className="flex gap-1.5 pt-1 border-t border-surface-700/40">
                      {[10000, 50000, 100000].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => addCashAmount(delta)}
                          className="flex-1 py-1 rounded-md text-[10px] font-bold bg-surface-900/60 border border-surface-700/60 text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors"
                        >
                          +{formatUZS(delta)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Change */}
                  {parsedTendered >= cartTotal && cartTotal > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-success-500/10 border border-success-500/30 text-xs">
                      <span className="font-bold text-success-600 dark:text-success-400">Qaytim berilishi kerak:</span>
                      <span className="text-base font-black text-success-600 dark:text-success-400">
                        {formatUZS(changeAmount)} so'm
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Total & Checkout Button */}
              <div className="pt-2">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-xs text-surface-400 font-semibold">To'lovga jami:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                      {formatUZS(cartTotal)}
                    </span>
                    <span className="text-xs font-normal text-surface-400 ml-1">so'm</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || cart.length === 0 || !!stockExceededItem}
                  id="pos-submit"
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-xl disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {submitting ? 'Savdo amalga oshirilmoqda...' : `Savdoni yakunlash (${formatUZS(cartTotal)} so'm)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal receipt={lastReceipt} onClose={() => setLastReceipt(null)} />
    </div>
  );
}
