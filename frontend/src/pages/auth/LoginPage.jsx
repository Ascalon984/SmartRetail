import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles,
    AlertCircle, X, Send, Shield, CheckCircle2, Sun, Moon
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

// ===== FORM SCHEMAS =====
const loginSchema = z.object({
    email: z.string().email('Masukkan email yang valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Masukkan email yang valid'),
});

// ===== CAPS LOCK DETECTION HOOK =====
const useCapsLock = () => {
    const [capsLockOn, setCapsLockOn] = useState(false);

    const handleKeyPress = useCallback((e) => {
        if (e.getModifierState) {
            setCapsLockOn(e.getModifierState('CapsLock'));
        }
    }, []);

    return { capsLockOn, handleKeyPress };
};

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);

    // Dark mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Forgot Password States
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState('');

    // Caps Lock Detection
    const { capsLockOn, handleKeyPress } = useCapsLock();

    // ===== FORM HOOKS =====
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        setFocus,
        watch,
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const {
        register: registerForgot,
        handleSubmit: handleForgotSubmit,
        formState: { errors: forgotErrors, isValid: isForgotValid },
        reset: resetForgotForm,
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onChange',
    });

    // Watch form values for real-time validation
    const formValues = watch();

    // ===== EFFECTS =====
    useEffect(() => {
        setFocus('email');
    }, [setFocus, showForgotPassword]);

    // Apply dark mode to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // ===== HANDLERS =====
    const onSubmit = async (data) => {
        if (!isValid) return;

        setIsLoading(true);
        setLoginError('');

        // Simulate realistic network delay (remove in production)
        await new Promise((r) => setTimeout(r, 600));

        const result = login(data);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setLoginError(result.message || 'Email atau password salah');
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setLoginError('');

        // Simulate OAuth flow (replace with actual implementation)
        await new Promise((r) => setTimeout(r, 1000));

        const result = login({
            email: 'user@gmail.com',
            password: 'google-oauth',
            rememberMe: false
        });

        if (result.success) {
            navigate('/dashboard');
        } else {
            setLoginError('Login dengan Google gagal. Silakan coba lagi.');
            setIsGoogleLoading(false);
        }
    };

    const handleForgotPassword = async (data) => {
        if (!isForgotValid) return;

        setIsSendingReset(true);
        setResetError('');

        // Simulate API call
        await new Promise((r) => setTimeout(r, 1200));

        const existingEmails = ['admin@smartretail.com', 'user@example.com'];

        if (existingEmails.includes(data.email)) {
            setResetSent(true);
            setForgotEmail(data.email);

            // Auto close after success
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetSent(false);
                resetForgotForm();
            }, 2500);
        } else {
            setResetError('Email tidak terdaftar dalam sistem kami.');
        }

        setIsSendingReset(false);
    };

    const closeForgotPasswordModal = () => {
        setShowForgotPassword(false);
        setResetSent(false);
        setResetError('');
        resetForgotForm();
    };

    // Handle Enter key on form
    const handleFormKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading && isValid) {
            handleSubmit(onSubmit)();
        }
    };

    // Image URL with parallax effect
    const leftPanelImage = "https://github.com/user-attachments/assets/95a538fa-dd01-4d2c-8df0-7db8d3a893d0";

    // Determine if submit should be disabled
    const isSubmitDisabled = isLoading || !isValid || Object.keys(errors).length > 0;

    return (
        <>
            <style>{`
                /* Hide browser's default password reveal button */
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear,
                input[type="password"]::-webkit-credentials-auto-fill-button,
                input[type="password"]::-webkit-textfield-decoration-container,
                input[type="password"]::-webkit-inner-spin-button,
                input[type="password"]::-webkit-outer-spin-button,
                input[type="password"]::-webkit-search-decoration,
                input[type="password"]::-webkit-search-cancel-button,
                input[type="password"]::-webkit-search-results-button,
                input[type="password"]::-webkit-search-results-decoration {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }
                
                /* Ensure custom eye button always visible */
                .password-toggle-btn {
                    z-index: 10;
                    cursor: pointer;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                /* Fix for Chrome autofill background */
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px white inset !important;
                    box-shadow: 0 0 0 30px white inset !important;
                }
                
                .dark input:-webkit-autofill,
                .dark input:-webkit-autofill:hover,
                .dark input:-webkit-autofill:focus,
                .dark input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #1f2937 inset !important;
                    box-shadow: 0 0 0 30px #1f2937 inset !important;
                    -webkit-text-fill-color: #f3f4f6 !important;
                }
            `}</style>

            <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
                {/* ===== LEFT PANEL: Premium Illustration with Parallax ===== */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Background Image with Subtle Zoom Effect */}
                    <div className="absolute inset-0 scale-105 hover:scale-110 transition-transform duration-10000 ease-out">
                        <img
                            src={leftPanelImage}
                            alt="SmartRetail - Visualisasi Data Penjualan & Investasi UMKM"
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                    </div>

                    {/* Gradient Overlay - Smooth transition between panels */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Content - Centered with modern typography */}
                    <div className="relative z-10 flex flex-col justify-end w-full h-full p-12 pb-16">
                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                                SmartRetail
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                                    Solusi Digital UMKM
                                </span>
                            </h1>

                            <p className="text-white/70 text-sm leading-relaxed">
                                Platform kasir modern yang membantu 10.000+ UMKM Indonesia
                                meningkatkan efisiensi dan profitabilitas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== RIGHT PANEL: Premium Login Form ===== */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white dark:bg-gray-900 transition-colors duration-200">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="absolute top-6 right-6 p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-700" />
                        )}
                    </button>

                    <div className="w-full max-w-md">
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SmartRetail POS</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Solusi Kasir untuk UMKM Indonesia</p>
                        </div>

                        {/* Welcome Section */}
                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Selamat Datang Kembali
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Masuk untuk melanjutkan pengelolaan bisnis Anda
                            </p>
                        </div>

                        {/* Global Error Alert */}
                        {loginError && (
                            <div
                                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-shake"
                                role="alert"
                                aria-live="polite"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-red-700 dark:text-red-300">{loginError}</span>
                            </div>
                        )}

                        {/* Google Login Button - Enhanced */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading}
                            className="w-full group relative flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-6"
                            aria-label="Masuk dengan Google"
                        >
                            {isGoogleLoading ? (
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>Lanjutkan dengan Google</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500">atau masuk dengan email</span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            onKeyDown={handleFormKeyDown}
                            className="space-y-5"
                            noValidate
                        >
                            {/* Email Field */}
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        placeholder="Masukkan alamat email"
                                        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 ${errors.email
                                            ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                                            }`}
                                        aria-invalid={errors.email ? 'true' : 'false'}
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                        autoComplete="email"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <p id="email-error" className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Field - FIXED: Eye icon always visible */}
                            <div>
                                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password"
                                        className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 ${errors.password
                                            ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                                            }`}
                                        aria-invalid={errors.password ? 'true' : 'false'}
                                        aria-describedby={errors.password ? 'password-error' : undefined}
                                        autoComplete="current-password"
                                        onKeyPress={handleKeyPress}
                                        {...register('password')}
                                    />
                                    {/* Eye Toggle Button - Always visible with proper styling */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors focus:outline-none password-toggle-btn"
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                        style={{ cursor: 'pointer', opacity: 1, visibility: 'visible' }}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Caps Lock Warning */}
                                {capsLockOn && (
                                    <p className="mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Caps Lock aktif
                                    </p>
                                )}

                                {errors.password && (
                                    <p id="password-error" className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-800 cursor-pointer"
                                        {...register('rememberMe')}
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                                        Ingat saya
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                                >
                                    Lupa password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="w-full relative group bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                aria-label="Masuk ke dashboard"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Masuk ke Dashboard
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Trust Indicator */}
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4 text-green-500 dark:text-green-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Login aman & data terenkripsi
                            </span>
                        </div>

                        {/* Demo Credentials - Subtle */}
                        <div className="mt-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-indigo-400 dark:text-indigo-500" />
                                Coba dengan akun demo
                            </p>
                            <div className="flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-gray-400 dark:text-gray-500">Email:</span>
                                    <span className="font-mono text-gray-600 dark:text-gray-300 ml-1">admin@smartretail.com</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 dark:text-gray-500">Password:</span>
                                    <span className="font-mono text-gray-600 dark:text-gray-300 ml-1">admin123</span>
                                </div>
                            </div>
                        </div>

                        {/* Sign up link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Belum punya akun?{' '}
                                <button
                                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                                    aria-label="Daftar akun baru"
                                >
                                    Daftar gratis
                                </button>
                            </p>
                        </div>

                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                            © 2026 SmartRetail — Solusi Digital untuk UMKM Indonesia
                        </p>
                    </div>
                </div>

                {/* ===== FORGOT PASSWORD MODAL - Enhanced ===== */}
                {showForgotPassword && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={closeForgotPasswordModal}
                    >
                        <div
                            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Lupa Password?
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Kami akan mengirimkan link reset ke email Anda
                                    </p>
                                </div>
                                <button
                                    onClick={closeForgotPasswordModal}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                    aria-label="Tutup modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                {!resetSent ? (
                                    <>
                                        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                            <div className="flex gap-3">
                                                <Mail className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                        Kirim link reset password
                                                    </p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                                                        Masukkan email yang terdaftar untuk menerima instruksi.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleForgotSubmit(handleForgotPassword)}>
                                            <div className="mb-6">
                                                <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Alamat Email
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                    <input
                                                        id="reset-email"
                                                        type="email"
                                                        placeholder="Masukkan alamat email"
                                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800"
                                                        {...registerForgot('email')}
                                                    />
                                                </div>
                                                {forgotErrors.email && (
                                                    <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {forgotErrors.email.message}
                                                    </p>
                                                )}
                                                {resetError && (
                                                    <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {resetError}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={closeForgotPasswordModal}
                                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSendingReset || !isForgotValid}
                                                    className="flex-1 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {isSendingReset ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                            </svg>
                                                            Mengirim...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <Send className="w-4 h-4" />
                                                            Kirim Link Reset
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Email Terkirim!
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                            Kami telah mengirimkan link reset password ke
                                            <span className="font-semibold block mt-1 text-indigo-600 dark:text-indigo-400">
                                                {forgotEmail}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Silakan cek inbox atau folder spam Anda.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {resetSent && (
                                <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={closeForgotPasswordModal}
                                        className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Custom CSS for animations */}
                <style jsx>{`
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.2s ease-out forwards;
                    }
                    @keyframes slide-up {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-slide-up {
                        animation: slide-up 0.3s ease-out forwards;
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-4px); }
                        75% { transform: translateX(4px); }
                    }
                    .animate-shake {
                        animation: shake 0.3s ease-in-out;
                    }
                    .transition-duration-10000 {
                        transition-duration: 10000ms;
                    }
                `}</style>
            </div>
        </>
    );
}