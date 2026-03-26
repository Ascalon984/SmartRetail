/**
 * Format number as Indonesian Rupiah currency.
 * @param {number} amount
 * @returns {string} e.g. "Rp 65.000"
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format date to Indonesian locale string.
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...options,
    };
    return new Intl.DateTimeFormat('id-ID', defaultOptions).format(new Date(date));
};

/**
 * Format date and time.
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
    return formatDate(date, {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Generate a random invoice number.
 * @returns {string} e.g. "INV-20260316-001"
 */
export const generateInvoice = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `INV-${dateStr}-${rand}`;
};

/**
 * Tailwind class merge helper.
 */
export { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
