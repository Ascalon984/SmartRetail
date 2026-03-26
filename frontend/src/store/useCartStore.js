import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            globalDiscount: 0,    // percentage
            taxRate: 11,           // PPN Indonesia 11%
            heldCarts: [],         // Draft / Hold feature

            addItem: (product) => {
                set((state) => {
                    const existing = state.items.find((i) => i.id === product.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        };
                    }
                    return {
                        items: [...state.items, { ...product, quantity: 1, discount: 0 }],
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === productId ? { ...i, quantity } : i
                    ),
                }));
            },

            setItemDiscount: (productId, discount) => {
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === productId ? { ...i, discount } : i
                    ),
                }));
            },

            setGlobalDiscount: (discount) => set({ globalDiscount: discount }),

            getSubtotal: () => {
                return get().items.reduce((sum, item) => {
                    const itemTotal = item.price * item.quantity;
                    const itemDiscount = (itemTotal * item.discount) / 100;
                    return sum + (itemTotal - itemDiscount);
                }, 0);
            },

            getTax: () => {
                const subtotal = get().getSubtotal();
                const afterGlobalDiscount = subtotal - (subtotal * get().globalDiscount) / 100;
                return (afterGlobalDiscount * get().taxRate) / 100;
            },

            getGrandTotal: () => {
                const subtotal = get().getSubtotal();
                const afterGlobalDiscount = subtotal - (subtotal * get().globalDiscount) / 100;
                return afterGlobalDiscount + get().getTax();
            },

            holdCart: () => {
                const { items, globalDiscount } = get();
                if (items.length === 0) return;
                set((state) => ({
                    heldCarts: [
                        ...state.heldCarts,
                        { id: Date.now(), items, globalDiscount, heldAt: new Date().toISOString() },
                    ],
                    items: [],
                    globalDiscount: 0,
                }));
            },

            restoreCart: (cartId) => {
                const cart = get().heldCarts.find((c) => c.id === cartId);
                if (!cart) return;
                set((state) => ({
                    items: cart.items,
                    globalDiscount: cart.globalDiscount,
                    heldCarts: state.heldCarts.filter((c) => c.id !== cartId),
                }));
            },

            clearCart: () => set({ items: [], globalDiscount: 0 }),

            getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
        }),
        {
            name: 'smartretail-cart',
        }
    )
);

export default useCartStore;
