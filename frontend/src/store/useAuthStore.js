import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            rememberMe: false,

            login: (credentials) => {
                // Dummy login simulation
                if (
                    credentials.email === 'admin@smartretail.com' &&
                    credentials.password === 'admin123'
                ) {
                    const userData = {
                        id: 1,
                        name: 'Admin SmartRetail',
                        email: 'admin@smartretail.com',
                        role: 'admin',
                        avatar: null,
                    };
                    set({
                        user: userData,
                        token: 'dummy-sanctum-token-' + Date.now(),
                        isAuthenticated: true,
                        rememberMe: credentials.rememberMe || false,
                    });
                    return { success: true, user: userData };
                }
                return { success: false, message: 'Email atau password salah' };
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            updateProfile: (data) => {
                set((state) => ({
                    user: { ...state.user, ...data },
                }));
            },
        }),
        {
            name: 'smartretail-auth',
            partialize: (state) =>
                state.rememberMe
                    ? { user: state.user, token: state.token, isAuthenticated: state.isAuthenticated, rememberMe: state.rememberMe }
                    : {},
        }
    )
);

export default useAuthStore;
