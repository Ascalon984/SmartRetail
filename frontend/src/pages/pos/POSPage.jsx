import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Search, X, Minus, Plus, Trash2, ShoppingCart, CreditCard, QrCode, Banknote, Percent, PauseCircle, ReceiptText, AlertCircle, ShoppingBag, Check } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import { fetchProducts, fetchCategories } from '../../services/dummyData';
import { formatCurrency, generateInvoice } from '../../utils/formatters';

// ===== CASH DIALPAD MODAL (IMPROVED UI) ===== //
const CashDialpadModal = memo(({ value, onChange, onClear, onConfirm, grandTotal, isProcessing }) => {
  const changeAmount = Number(value) - grandTotal;
  const cashInputRef = useRef(null);

  useEffect(() => {
    cashInputRef.current?.focus();
  }, []);

  const handleNumberClick = (num) => {
    onChange(value + num);
  };

  const handleBackspace = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value && changeAmount >= 0) {
      e.preventDefault();
      onConfirm();
    } else if (e.key === 'Escape') {
      onClear();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClear} />

      {/* 🔥 LEBIH LEBAR */}
      <div className="relative w-full max-w-lg rounded-2xl p-5 shadow-2xl"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >

        {/* HEADER */}
        <div className="text-center mb-4">
          <h3 className="text-[20px] font-bold">Pembayaran Tunai</h3>
          <p className="text-[12px] opacity-70">Masukkan uang diterima</p>
        </div>

        {/* TOTAL */}
        <div className="bg-indigo-500/10 rounded-xl p-3 text-center mb-4 border border-indigo-500/20">
          <p className="text-[10px] uppercase tracking-widest text-indigo-400 mb-1">Total</p>
          <p className="text-[26px] font-black text-indigo-400">
            {formatCurrency(grandTotal)}
          </p>
        </div>

        {/* QUICK BUTTON */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[20000, 50000, 100000, grandTotal].map((amount, i) => (
            <button
              key={i}
              onClick={() => onChange(String(amount))}
              className="py-2 rounded-lg text-[12px] font-bold border border-white/10 hover:bg-white/5"
            >
              {i === 3 ? 'Pas' : `${amount / 1000}K`}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <input
          ref={cashInputRef}
          type="text"
          inputMode="numeric"
          value={value ? formatCurrency(Number(value)).replace('Rp', '').trim() : ''}
          onChange={(e) => {
            const numeric = e.target.value.replace(/[^0-9]/g, '');
            onChange(numeric);
          }}
          placeholder="0"
          className="w-full text-center text-2xl font-bold py-3 rounded-xl border outline-none mb-3
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{
            borderColor:
              value && changeAmount >= 0
                ? 'var(--color-primary-400)'
                : value && changeAmount < 0
                  ? '#ef4444'
                  : 'var(--color-border)',
            background: 'var(--color-bg-body)',
          }}
        />

        {/* DIALPAD 🔥 LEBIH COMPACT */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="py-3 rounded-lg text-lg font-bold border border-white/10 hover:bg-white/5 active:scale-95"
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => handleNumberClick('00')}
            className="py-3 rounded-lg font-bold border border-white/10 hover:bg-white/5"
          >
            00
          </button>

          <button
            onClick={() => handleNumberClick('0')}
            className="py-3 rounded-lg text-lg font-bold border border-white/10 hover:bg-white/5"
          >
            0
          </button>

          {/* 🔥 BACKSPACE FIX */}
          <button
            onClick={handleBackspace}
            className="py-3 rounded-lg flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 active:scale-95"
          >
            ←
          </button>
        </div>

        {/* INFO */}
        {value && changeAmount >= 0 && (
          <div className="text-center mt-3 text-green-400 text-sm font-semibold">
            Kembalian: {formatCurrency(changeAmount)}
          </div>
        )}

        {value && changeAmount < 0 && (
          <div className="text-center mt-3 text-red-400 text-sm font-semibold">
            Kurang: {formatCurrency(Math.abs(changeAmount))}
          </div>
        )}

        {/* ACTION */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClear}
            className="flex-1 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            disabled={!value || changeAmount < 0 || isProcessing}
            className="flex-1 py-2 rounded-lg font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40"
          >
            {isProcessing ? 'Proses...' : 'Konfirmasi'}
          </button>
        </div>

      </div>
    </div>
  );
});

// ===== PRODUCT CARD ===== //
const ProductCard = memo(({ product, onAdd }) => {
  return (
    <button onClick={() => onAdd(product)}
      className="card p-3.5 text-left hover:shadow-card-hover hover:border-indigo-200 transition-all duration-200 animate-scale-in group active:scale-95 flex flex-col justify-between h-full bg-white dark:bg-slate-800"
      id={`product-${product.id}`}>

      <div>
        <div className="w-full h-28 rounded-xl mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]"
          style={{ background: 'var(--color-surface-100)' }}>
          <ShoppingBag className="w-8 h-8 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <p className="text-[13px] font-bold leading-tight mb-1.5 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
          style={{ color: 'var(--color-text-primary)' }}>
          {product.name}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-[15px] font-extrabold tracking-tight" style={{ color: 'var(--color-primary-600)' }}>
          {formatCurrency(product.price)}
        </span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${product.stock <= 5 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
          {product.stock} pcs
        </span>
      </div>
    </button>
  );
});

// ===== CART ITEM ===== //
const CartItem = memo(({ item, isLastAdded }) => {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className={`flex items-start gap-3 py-3.5 px-3 border-b border-transparent transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 relative group
                    ${isLastAdded ? 'bg-indigo-50/50 dark:bg-indigo-900/10 animate-pulse-once' : ''}`}
      style={{ borderBottomColor: 'var(--color-border)' }}>

      {isLastAdded && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-r-md" />}

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate leading-tight mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{item.name}</p>
        <p className="text-[11px] font-medium" style={{ color: 'var(--color-primary-500)' }}>{formatCurrency(item.price)}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-[14px] font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
          {formatCurrency(item.price * item.quantity)}
        </span>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors bg-white hover:bg-red-50 hover:text-red-500 shadow-sm dark:bg-slate-700 dark:hover:bg-red-900/30">
            {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>
          <span className="w-6 text-center text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-sm dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-600">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

// ===== SUCCESS MODAL ===== //
const SuccessModal = memo(({ invoice, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl p-8 text-center animate-scale-in shadow-2xl"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
          <Check className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>Berhasil!</h3>
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>Nomor Invoice:</p>
        <p className="text-lg font-mono font-bold mb-8 tracking-wider bg-slate-100 dark:bg-slate-800 py-2 rounded-lg mt-1" style={{ color: 'var(--color-primary-600)' }}>{invoice}</p>
        <button onClick={onClose} className="btn-primary w-full py-3.5 text-[15px] shadow-xl">Transaksi Baru (Enter)</button>
      </div>
    </div>
  );
});

// ===== MAIN POS PAGE ===== //
export default function POSPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState('');
  const [lastAddedId, setLastAddedId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showCashDialpad, setShowCashDialpad] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const searchRef = useRef(null);
  const categoriesScrollRef = useRef(null);

  const items = useCartStore((s) => s.items);
  const addItemStore = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const holdCart = useCartStore((s) => s.holdCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTax = useCartStore((s) => s.getTax);
  const getGrandTotal = useCartStore((s) => s.getGrandTotal);
  const globalDiscount = useCartStore((s) => s.globalDiscount);
  const setGlobalDiscount = useCartStore((s) => s.setGlobalDiscount);

  const handleAddItem = useCallback((product) => {
    addItemStore(product);
    setSearchQuery('');
    searchRef.current?.focus();
    setLastAddedId(product.id);
    setTimeout(() => setLastAddedId(null), 1000);
  }, [addItemStore]);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).then(([prods, cats]) => {
      setAllProducts(prods);
      setFilteredProducts(prods);
      setCategoriesList(cats);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = [...allProducts];
    if (selectedCategory !== 1) result = result.filter((p) => p.category_id === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, allProducts]);

  const handleSelectPaymentMethod = useCallback((method) => {
    setSelectedPaymentMethod(method);
    if (method === 'cash') {
      setCashAmount('');
      setShowCashDialpad(true);
    } else {
      setShowCashDialpad(false);
    }
  }, []);

  const handleCashConfirm = useCallback(() => {
    const changeAmount = Number(cashAmount) - getGrandTotal();
    if (!cashAmount || changeAmount < 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const inv = generateInvoice();
      setLastInvoice(inv);
      setShowSuccess(true);
      clearCart();
      setGlobalDiscount(0);
      setSelectedPaymentMethod(null);
      setCashAmount('');
      setShowCashDialpad(false);
      setIsProcessing(false);
    }, 500);
  }, [cashAmount, getGrandTotal, clearCart, setGlobalDiscount]);

  const handlePay = useCallback(() => {
    if (items.length === 0) return;

    if (selectedPaymentMethod === 'cash') {
      if (showCashDialpad) {
        handleCashConfirm();
      } else {
        setShowCashDialpad(true);
      }
    } else if (selectedPaymentMethod === 'qris' || selectedPaymentMethod === 'debit') {
      setIsProcessing(true);
      setTimeout(() => {
        const inv = generateInvoice();
        setLastInvoice(inv);
        setShowSuccess(true);
        clearCart();
        setGlobalDiscount(0);
        setSelectedPaymentMethod(null);
        setIsProcessing(false);
      }, 500);
    }
  }, [selectedPaymentMethod, items.length, showCashDialpad, handleCashConfirm, clearCart, setGlobalDiscount]);

  const handleCloseCashDialpad = useCallback(() => {
    setShowCashDialpad(false);
    setCashAmount('');
    setSelectedPaymentMethod(null);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      if (showSuccess || showCashDialpad) return;

      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Enter' && document.activeElement === searchRef.current) {
        e.preventDefault();
        if (filteredProducts.length > 0) handleAddItem(filteredProducts[0]);
      } else if (e.key === 'F1') {
        e.preventDefault();
        if (items.length > 0) handleSelectPaymentMethod('cash');
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (items.length > 0) handleSelectPaymentMethod('qris');
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (items.length > 0) handleSelectPaymentMethod('debit');
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (items.length > 0 && selectedPaymentMethod) handlePay();
      } else if (e.key === 'Escape') {
        if (showCashDialpad) handleCloseCashDialpad();
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, [showSuccess, showCashDialpad, filteredProducts, items, handleAddItem, handleSelectPaymentMethod, selectedPaymentMethod, handlePay, handleCloseCashDialpad]);

  if (loading) return <div className="flex items-center justify-center h-[calc(100vh-4rem)]"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-indigo-500" /></div>;

  const isPayDisabled = items.length === 0 || !selectedPaymentMethod;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-4rem)] -m-4 sm:-m-6 pt-2 pb-0 px-2 animate-fade-in bg-slate-50 dark:bg-slate-900 overflow-hidden">

      {/* LEFT: Product Catalog */}
      <div className="flex-1 lg:w-[65%] flex flex-col min-w-0 h-full p-2">
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          <input ref={searchRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk atau SKU... ( / )" autoFocus
            className="input-field pl-12 pr-14 py-3.5 text-[15px] shadow-sm font-semibold rounded-xl" />

          {searchQuery ? (
            <button onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100" style={{ color: 'var(--color-text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold border" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', background: 'var(--color-surface-100)' }}>
              /
            </div>
          )}
        </div>

        {/* Categories with horizontal scroll - icons removed */}
        <div
          ref={categoriesScrollRef}
          className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide shrink-0"
          style={{ scrollbarWidth: 'thin', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); searchRef.current?.focus(); }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap border transform active:scale-95
                  ${isActive ? 'shadow-md scale-[1.02] border-indigo-200 dark:border-indigo-800' : 'hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent shadow-sm'}
                `}
                style={{
                  background: isActive ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))' : 'var(--color-surface-100)',
                  color: isActive ? '#fff' : 'var(--color-text-primary)'
                }}>
                {cat.name}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pr-1 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-8">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAddItem} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>Tidak menemukan produk</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Coba kata kunci lain atau pilih kategori berbeda</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart Panel */}
      <div className="lg:w-[35%] flex flex-col bg-white dark:bg-slate-900 shadow-[0_0_40px_rgba(0,0,0,0.05)] border-l h-full shrink-0 z-10" style={{ borderColor: 'var(--color-border)' }}>

        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
          <h3 className="text-[16px] font-black flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <ShoppingCart className="w-5 h-5 text-indigo-500" />
            Keranjang
            {items.length > 0 && <span className="bg-indigo-500 text-white px-2 py-0.5 rounded-full text-[11px] mb-0.5">{items.length}</span>}
          </h3>
          {items.length > 0 && (
            <div className="flex gap-1.5">
              <button onClick={holdCart} className="p-2 rounded-lg btn-ghost hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 text-amber-500 transition-colors" title="Hold/Draft (Ctrl+H)">
                <PauseCircle className="w-4.5 h-4.5" />
              </button>
              <button onClick={clearCart} className="p-2 rounded-lg btn-ghost hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 text-red-500 transition-colors" title="Bersihkan Keranjang">
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0c1222]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in opacity-80">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 border-4 border-white dark:border-slate-900 shadow-sm">
                <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-[20px] font-black mb-1" style={{ color: 'var(--color-text-primary)' }}>Belum ada item</p>
              <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Mulai scan produk atau pilih dari daftar sebelah kiri.</p>

              <div className="mt-8 flex gap-3 text-left w-full">
                <div className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-[12px] font-bold text-slate-500 mb-1">Shortcut Kasir</p>
                  <p className="text-[11px] text-slate-400 font-mono"><span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">/</span> Cari</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1"><span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">F1-F3</span> Pilih Metode</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1"><span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">F9</span> Bayar</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-4">
              {items.map((item) => <CartItem key={item.id} item={item} isLastAdded={item.id === lastAddedId} />)}
            </div>
          )}
        </div>

        {/* Cart Summary & Checkout - Sticky Bottom */}
        <div className="px-5 pt-3 pb-4 bg-white dark:bg-slate-900 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10 sticky bottom-0">

          {items.length > 0 && (
            <div className="flex gap-2 mb-3">
              {[0, 5, 10, 20].map(val => (
                <button key={val} onClick={() => setGlobalDiscount(val)}
                  className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all border transform active:scale-95
                          ${globalDiscount === val ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/50 dark:text-indigo-300'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
                  {val === 0 ? 'No Disc' : `${val}%`}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>

            {globalDiscount > 0 && (
              <div className="flex justify-between text-[13px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 -mx-2 rounded-lg">
                <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> Diskon ({globalDiscount}%)</span>
                <span>-{formatCurrency(getSubtotal() * globalDiscount / 100)}</span>
              </div>
            )}

            <div className="flex justify-between text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              <span>Pajak (PPN 11%)</span>
              <span>{formatCurrency(getTax())}</span>
            </div>
          </div>

          <div className="border-t border-dashed mt-2 pt-3 mb-4" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-end">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Tagihan</p>
              <p className="text-[32px] font-black leading-none tracking-tighter text-indigo-600 dark:text-indigo-400">
                {formatCurrency(getGrandTotal())}
              </p>
            </div>
          </div>

          {/* Quick Payment Buttons */}
          {items.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">

              {/* CASH */}
              <button
                onClick={() => handleSelectPaymentMethod('cash')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all border transform active:scale-95 hover:scale-[1.03]
                ${selectedPaymentMethod === 'cash'
                    ? 'bg-green-500 text-white border-green-600 shadow-md dark:bg-green-500/70 dark:border-green-400 dark:text-green-100'
                    : 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-500/20 dark:border-green-500/40 dark:text-green-400'
                  }`}
              >
                <Banknote
                  className={`w-4 h-4 ${selectedPaymentMethod === 'cash'
                    ? 'text-white dark:text-green-100'
                    : 'text-green-600 dark:text-green-400'
                    }`}
                />
                <span className="text-[12px] font-bold">Tunai</span>
                <span className="text-[9px] font-mono opacity-60">F1</span>
              </button>

              {/* QRIS */}
              <button
                onClick={() => handleSelectPaymentMethod('qris')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all border transform active:scale-95 hover:scale-[1.03]
                ${selectedPaymentMethod === 'qris'
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md dark:bg-blue-500/70 dark:border-blue-400 dark:text-blue-100'
                    : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 dark:bg-blue-500/20 dark:border-blue-500/40 dark:text-blue-400'
                  }`}
              >
                <QrCode
                  className={`w-4 h-4 ${selectedPaymentMethod === 'qris'
                    ? 'text-white dark:text-blue-100'
                    : 'text-blue-600 dark:text-blue-400'
                    }`}
                />
                <span className="text-[12px] font-bold">QRIS</span>
                <span className="text-[9px] font-mono opacity-60">F2</span>
              </button>

              {/* DEBIT */}
              <button
                onClick={() => handleSelectPaymentMethod('debit')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all border transform active:scale-95 hover:scale-[1.03]
                ${selectedPaymentMethod === 'debit'
                    ? 'bg-purple-500 text-white border-purple-600 shadow-md dark:bg-purple-500/70 dark:border-purple-400 dark:text-purple-100'
                    : 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 dark:bg-purple-500/20 dark:border-purple-500/40 dark:text-purple-400'
                  }`}
              >
                <CreditCard
                  className={`w-4 h-4 ${selectedPaymentMethod === 'debit'
                    ? 'text-white dark:text-purple-100'
                    : 'text-purple-600 dark:text-purple-400'
                    }`}
                />
                <span className="text-[12px] font-bold">Debit</span>
                <span className="text-[9px] font-mono opacity-60">F3</span>
              </button>

            </div>
          )}

          {/* PAY BUTTON */}
          <button
            onClick={handlePay}
            disabled={isPayDisabled || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[16px] font-bold text-white
                      transition-all disabled:opacity-50 disabled:cursor-not-allowed
                      active:scale-[0.98] shadow-md hover:shadow-lg"

            style={{
              background: isPayDisabled
                ? 'var(--color-surface-300)'
                : 'linear-gradient(135deg, #4f46e5, #4338ca)', // 🔥 lebih bold dari var
              border: '1px solid rgba(0,0,0,0.1)'
            }}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Bayar Sekarang</span>
                <span className="text-[10px] font-mono bg-black/30 px-1.5 py-0.5 rounded ml-2 hidden sm:block">
                  F9
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {showCashDialpad && (
        <CashDialpadModal
          value={cashAmount}
          onChange={setCashAmount}
          onClear={handleCloseCashDialpad}
          onConfirm={handleCashConfirm}
          grandTotal={getGrandTotal()}
          isProcessing={isProcessing}
        />
      )}

      {showSuccess && <SuccessModal invoice={lastInvoice} onClose={() => setShowSuccess(false)} />}
    </div>
  );
}

// Add these styles to your global CSS
const style = document.createElement('style');
style.textContent = `
  .dialpad-btn {
    @apply rounded-lg text-lg font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700;
    background: var(--color-bg-card);
    color: var(--color-text-primary);
    padding: 0.75rem;
  }
  .animate-pulse-once {
    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) 1;
  }
  .animate-shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; background-color: rgba(99, 102, 241, 0.1); }
  }
  
  /* Custom scrollbar for categories */
  .scrollbar-hide::-webkit-scrollbar {
    height: 4px;
  }
  
  .scrollbar-hide::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  
  .scrollbar-hide::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }
  
  .scrollbar-hide::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  .dark .scrollbar-hide::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .dark .scrollbar-hide::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .dark .scrollbar-hide::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;
document.head.appendChild(style);