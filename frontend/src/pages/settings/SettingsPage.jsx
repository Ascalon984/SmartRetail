import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Store, Building, Phone, Mail, MapPin, Percent, Globe, Printer,
  FileText, Image, Upload, X, RefreshCw, CheckCircle2, AlertCircle,
  Eye, ToggleLeft, ToggleRight, Receipt, Printer as PrinterIcon,
  AlertTriangle, Link2, Wifi, WifiOff
} from 'lucide-react';

// ============= HELPER FUNCTIONS =============
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const formatCurrency = (amount, currency = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
};

const calculateTax = (subtotal, taxRate, taxInclusive) => {
  if (taxInclusive) {
    return subtotal - (subtotal / (1 + taxRate / 100));
  }
  return subtotal * (taxRate / 100);
};

const calculateTotal = (subtotal, tax, taxInclusive) => {
  return taxInclusive ? subtotal : subtotal + tax;
};

const DEFAULT_SETTINGS = {
  storeName: 'Smart Retail Indonesia',
  storePhone: '021-5555-1234',
  storeEmail: 'admin@smartretail.id',
  storeAddress: 'Jl. Sudirman No. 123',
  storeCity: 'Jakarta Pusat',
  storePostalCode: '10110',
  taxRate: '11',
  taxInclusive: false,
  currency: 'IDR',
  receiptFooter: 'Terima kasih atas kunjungan Anda\nBarang yang sudah dibeli tidak dapat dikembalikan',
  receiptCopies: '1',
  autoPrint: true,
  showLogoOnReceipt: true,
  logo: null,
  printerConnected: false
};

// Sample transaction data for preview
const PREVIEW_ITEMS = [
  { name: 'Indomie Goreng', qty: 2, price: 3500 },
  { name: 'Teh Botol Sosro', qty: 1, price: 5000 },
  { name: 'Roti Tawar Gandum', qty: 1, price: 12000 },
  { name: 'Pensil 2B', qty: 3, price: 2000 }
];

// ============= RECEIPT PREVIEW COMPONENT =============
const ReceiptPreview = ({ settings, logoPreview }) => {
  const subtotal = calculateSubtotal(PREVIEW_ITEMS);
  const taxRate = parseFloat(settings.taxRate) || 0;
  const tax = calculateTax(subtotal, taxRate, settings.taxInclusive);
  const total = calculateTotal(subtotal, tax, settings.taxInclusive);
  const currentDate = new Date();

  const formatDateTime = () => {
    return currentDate.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Placeholder logo when showLogoOnReceipt is true but no logo uploaded
  const PlaceholderLogo = () => (
    <div className="flex justify-center mb-2">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
        <Store className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Preview Struk</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">80mm | Thermal</span>
        </div>
      </div>

      {/* Thermal Printer Style Preview */}
      <div className="p-4 flex justify-center bg-gray-50">
        <div className="w-[280px] bg-white shadow-lg rounded-sm">
          <div className="p-3 font-mono text-[11px] text-gray-900">
            {/* Header */}
            <div className="text-center mb-3">
              {settings.showLogoOnReceipt && (
                logoPreview ? (
                  <div className="flex justify-center mb-2">
                    <img src={logoPreview} alt="Logo" className="h-12 object-contain" />
                  </div>
                ) : (
                  <PlaceholderLogo />
                )
              )}
              <div className="font-bold text-sm uppercase tracking-wide">
                {settings.storeName}
              </div>
              <div className="text-[10px] text-gray-600 mt-1 leading-tight">
                {settings.storeAddress}<br />
                {settings.storeCity} - {settings.storePostalCode}<br />
                Telp: {settings.storePhone}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* Transaction Info */}
            <div className="text-[10px] mb-2">
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDateTime()}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>Admin</span>
              </div>
              <div className="flex justify-between">
                <span>No. Transaksi:</span>
                <span>#PREVIEW-001</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* Items Header */}
            <div className="flex justify-between text-[10px] font-bold mb-1">
              <span className="flex-1">Item</span>
              <span className="w-12 text-right">Qty</span>
              <span className="w-16 text-right">Harga</span>
              <span className="w-16 text-right">Total</span>
            </div>

            {/* Items */}
            <div className="space-y-1 mb-2">
              {PREVIEW_ITEMS.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px]">
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="w-12 text-right">{item.qty}</span>
                  <span className="w-16 text-right">
                    {formatCurrency(item.price, settings.currency)}
                  </span>
                  <span className="w-16 text-right">
                    {formatCurrency(item.price * item.qty, settings.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* Totals */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, settings.currency)}</span>
              </div>

              {!settings.taxInclusive && (
                <div className="flex justify-between">
                  <span>PPN {settings.taxRate}%:</span>
                  <span>{formatCurrency(tax, settings.currency)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold pt-1 border-t border-gray-300">
                <span>TOTAL:</span>
                <span className="text-sm">{formatCurrency(total, settings.currency)}</span>
              </div>

              {settings.taxInclusive && (
                <div className="text-[9px] text-gray-500 text-center pt-1">
                  *Harga termasuk PPN {settings.taxRate}%
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* Footer */}
            <div className="text-center text-[9px] text-gray-600 whitespace-pre-line">
              {settings.receiptFooter}
            </div>

            {/* Dummy barcode */}
            <div className="flex justify-center mt-2">
              <div className="h-4 w-32 bg-gray-200"></div>
            </div>

            <div className="text-center text-[8px] text-gray-400 mt-2">
              Terima kasih telah berbelanja
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= MAIN COMPONENT =============
export default function SettingsPage() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [errors, setErrors] = useState({});
  const [dirtyFields, setDirtyFields] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [logoPreview, setLogoPreview] = useState(null);
  const [isConnectingPrinter, setIsConnectingPrinter] = useState(false);
  const fileInputRef = useRef(null);
  const debouncedSaveRef = useRef(null);

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('storeSettings');
        const savedLogo = localStorage.getItem('storeLogo');

        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setForm(prev => ({ ...prev, ...parsedSettings }));
        }

        if (savedLogo) {
          setLogoPreview(savedLogo);
          setForm(prev => ({ ...prev, logo: savedLogo }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Auto-save function with debounce
  const saveToLocalStorage = useCallback(async (data) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      localStorage.setItem('storeSettings', JSON.stringify(data));
      if (data.logo) {
        localStorage.setItem('storeLogo', data.logo);
      } else {
        localStorage.removeItem('storeLogo');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Setup debounced save
  useEffect(() => {
    debouncedSaveRef.current = debounce((data) => {
      saveToLocalStorage(data);
    }, 500);

    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel?.();
      }
    };
  }, [saveToLocalStorage]);

  // Update field with auto-save
  const updateField = useCallback((key, value) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      setDirtyFields(prevDirty => ({ ...prevDirty, [key]: true }));
      validateField(key, value);

      if (debouncedSaveRef.current) {
        debouncedSaveRef.current(updated);
      }

      return updated;
    });
  }, []);

  // Validation
  const validateField = (key, value) => {
    const newErrors = { ...errors };

    switch (key) {
      case 'storeName':
        if (!value?.trim()) {
          newErrors.storeName = 'Nama toko diperlukan';
        } else if (value.length < 3) {
          newErrors.storeName = 'Minimal 3 karakter';
        } else {
          delete newErrors.storeName;
        }
        break;

      case 'storePhone':
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (value && !phoneRegex.test(value)) {
          newErrors.storePhone = 'Format telepon tidak valid';
        } else {
          delete newErrors.storePhone;
        }
        break;

      case 'storeEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          newErrors.storeEmail = 'Format email tidak valid';
        } else {
          delete newErrors.storeEmail;
        }
        break;

      case 'taxRate':
        const rate = parseFloat(value);
        if (isNaN(rate)) {
          newErrors.taxRate = 'Harus berupa angka';
        } else if (rate < 0) {
          newErrors.taxRate = 'Tidak boleh negatif';
        } else if (rate > 100) {
          newErrors.taxRate = 'Maksimal 100%';
        } else {
          delete newErrors.taxRate;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // Logo handling
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const logoData = reader.result;
        setLogoPreview(logoData);
        setDirtyFields(prev => ({ ...prev, logo: true }));
        updateField('logo', logoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setDirtyFields(prev => ({ ...prev, logo: true }));
    updateField('logo', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Printer connection handler
  const handlePrinterConnection = async () => {
    setIsConnectingPrinter(true);

    // Simulate printer connection process
    setTimeout(() => {
      const newConnectionState = !form.printerConnected;
      updateField('printerConnected', newConnectionState);
      setIsConnectingPrinter(false);

      // Show feedback message
      if (newConnectionState) {
        alert('Perangkat printer berhasil dihubungkan!');
      } else {
        alert('Perangkat printer diputuskan.');
      }
    }, 1500);
  };

  // Simulate print
  const simulatePrint = () => {
    if (!form.printerConnected) {
      alert('Silakan hubungkan perangkat printer terlebih dahulu.');
      return;
    }

    console.log('Print simulation:', {
      ...form,
      items: PREVIEW_ITEMS,
      timestamp: new Date().toISOString()
    });
    alert('Simulasi cetak: Lihat console browser untuk detail');
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateField('storePhone', formatted);
  };

  const getFieldError = (field) => errors[field];
  const isFieldDirty = (field) => dirtyFields[field];

  const currencyOptions = [
    { value: 'IDR', label: 'IDR — Indonesian Rupiah', symbol: 'Rp' },
    { value: 'USD', label: 'USD — US Dollar', symbol: '$' },
    { value: 'SGD', label: 'SGD — Singapore Dollar', symbol: 'S$' },
    { value: 'MYR', label: 'MYR — Malaysian Ringgit', symbol: 'RM' }
  ];

  const tabs = [
    { id: 'general', label: 'Informasi Toko', icon: Store, desc: 'Identitas & Kontak' },
    { id: 'transaction', label: 'Transaksi & Pajak', icon: Percent, desc: 'PPN & Mata Uang' },
    { id: 'receipt', label: 'Struk & Cetak', icon: Printer, desc: 'Kustomisasi Cetak' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Pengaturan Sistem
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Kelola konfigurasi toko & sistem POS
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-save Status */}
              {isSaving && (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-xs font-medium">Menyimpan...</span>
                </div>
              )}
              {saved && !isSaving && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Tersimpan</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
          <nav className="p-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left mb-1 relative ${activeTab === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                  }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-r" />
                )}
                <tab.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tab.label}</p>
                  <p className="text-xs opacity-70 truncate">{tab.desc}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0 p-6">
          <div className="max-w-6xl mx-auto">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Informasi Toko
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Detail dasar untuk struk dan transaksi
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Logo Upload Section */}
                    <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Logo Toko
                      </label>
                      <div className="flex items-start gap-5">
                        {logoPreview ? (
                          <div className="relative group">
                            <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 shadow-sm transition-all group-hover:shadow-md">
                              <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
                            </div>
                            <button
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-28 h-28 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center transition-all hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer"
                          >
                            <Image className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500">Upload Logo</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 mb-2"
                          >
                            <Upload className="w-4 h-4" />
                            {logoPreview ? 'Ganti Logo' : 'Pilih File'}
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Format: JPG, PNG (max. 2MB). Logo akan ditampilkan di struk.
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Nama Toko <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            value={form.storeName}
                            onChange={e => updateField('storeName', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700 ${getFieldError('storeName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="Nama Bisnis Anda"
                          />
                          {isFieldDirty('storeName') && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            </div>
                          )}
                        </div>
                        {getFieldError('storeName') && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {getFieldError('storeName')}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Nomor Telepon
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            value={form.storePhone}
                            onChange={handlePhoneChange}
                            className={`w-full pl-9 pr-3 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700 ${getFieldError('storePhone') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="0812-3456-7890"
                          />
                        </div>
                        {getFieldError('storePhone') && (
                          <p className="text-xs text-red-500 mt-1">{getFieldError('storePhone')}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Email Admin
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={form.storeEmail}
                            onChange={e => updateField('storeEmail', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700 ${getFieldError('storeEmail') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="admin@smartretail.com"
                          />
                        </div>
                        {getFieldError('storeEmail') && (
                          <p className="text-xs text-red-500 mt-1">{getFieldError('storeEmail')}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Alamat Lengkap
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <textarea
                            rows="2"
                            value={form.storeAddress}
                            onChange={e => updateField('storeAddress', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none dark:bg-gray-700"
                            placeholder="Jl. Merdeka Raya No.45"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Kota
                        </label>
                        <input
                          value={form.storeCity}
                          onChange={e => updateField('storeCity', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Kode Pos
                        </label>
                        <input
                          value={form.storePostalCode}
                          onChange={e => updateField('storePostalCode', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Settings Tab */}
            {activeTab === 'transaction' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Pajak & Mata Uang
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Konfigurasi perhitungan transaksi
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Tarif PPN (%)
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={form.taxRate}
                            onChange={e => updateField('taxRate', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700 ${getFieldError('taxRate') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                          />
                          {isFieldDirty('taxRate') && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            </div>
                          )}
                        </div>
                        {getFieldError('taxRate') && (
                          <p className="text-xs text-red-500 mt-1">{getFieldError('taxRate')}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Mata Uang
                        </label>
                        <select
                          value={form.currency}
                          onChange={e => updateField('currency', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer dark:bg-gray-700"
                        >
                          {currencyOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Harga Sudah Termasuk PPN
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Jika aktif, kasir tidak akan menambah pajak di total akhir
                        </p>
                      </div>
                      <button
                        onClick={() => updateField('taxInclusive', !form.taxInclusive)}
                        className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                      >
                        {form.taxInclusive ? (
                          <ToggleRight className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Settings Tab */}
            {activeTab === 'receipt' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Struk & Cetak
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Konfigurasi tampilan dan perilaku cetak
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Connect Printer Button */}
                        <button
                          onClick={handlePrinterConnection}
                          disabled={isConnectingPrinter}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${form.printerConnected
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                          {isConnectingPrinter ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Menghubungkan...</span>
                            </>
                          ) : form.printerConnected ? (
                            <>
                              <Wifi className="w-3.5 h-3.5" />
                              <span>Terhubung</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="w-3.5 h-3.5" />
                              <span>Hubungkan Printer</span>
                            </>
                          )}
                        </button>

                        {/* Simulate Print Button */}
                        <button
                          onClick={simulatePrint}
                          disabled={!form.printerConnected}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${form.printerConnected
                            ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                          title={!form.printerConnected ? 'Hubungkan printer terlebih dahulu' : 'Simulasi cetak struk'}
                        >
                          <PrinterIcon className="w-3.5 h-3.5" />
                          Simulasi Cetak
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Form Section */}
                      <div className="lg:col-span-3 space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Pesan Footer Struk
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                              rows="3"
                              value={form.receiptFooter}
                              onChange={e => updateField('receiptFooter', e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none dark:bg-gray-700"
                              placeholder="Terima kasih atas kunjungan Anda!"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                              Jumlah Copy Struk
                            </label>
                            <select
                              value={form.receiptCopies}
                              onChange={e => updateField('receiptCopies', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer dark:bg-gray-700"
                            >
                              {[1, 2, 3].map(num => (
                                <option key={num} value={num}>{num} copy{num > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => updateField('autoPrint', !form.autoPrint)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Otomatis Cetak Struk
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Printer langsung berjalan saat pembayaran sukses
                              </p>
                            </div>
                            {form.autoPrint ? (
                              <ToggleRight className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-gray-400" />
                            )}
                          </button>

                          <button
                            onClick={() => updateField('showLogoOnReceipt', !form.showLogoOnReceipt)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Tampilkan Logo Toko
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Cetak header struk dengan logo
                              </p>
                            </div>
                            {form.showLogoOnReceipt ? (
                              <ToggleRight className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Preview Section */}
                      <div className="lg:col-span-2">
                        <ReceiptPreview settings={form} logoPreview={logoPreview} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}