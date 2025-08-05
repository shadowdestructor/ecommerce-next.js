import { create } from 'zustand';
import { CheckoutState, CheckoutStep } from '@/types/checkout';
import { Address } from '@/types/order';

interface CheckoutStore extends CheckoutState {
  // Actions
  setStep: (step: CheckoutStep) => void;
  setEmail: (email: string) => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setUseSameAddress: (useSame: boolean) => void;
  setPaymentMethod: (method: string) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  
  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  canProceedToNext: () => boolean;
}

const initialState: CheckoutState = {
  step: CheckoutStep.SHIPPING,
  email: '',
  shippingAddress: null,
  billingAddress: null,
  useSameAddress: true,
  paymentMethod: '',
  isProcessing: false,
  error: null,
};

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  
  setEmail: (email) => set({ email }),
  
  setShippingAddress: (address) => {
    const state = get();
    set({ 
      shippingAddress: address,
      billingAddress: state.useSameAddress ? address : state.billingAddress,
    });
  },
  
  setBillingAddress: (address) => set({ billingAddress: address }),
  
  setUseSameAddress: (useSame) => {
    const state = get();
    set({ 
      useSameAddress: useSame,
      billingAddress: useSame ? state.shippingAddress : state.billingAddress,
    });
  },
  
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  
  setProcessing: (processing) => set({ isProcessing: processing }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),

  nextStep: () => {
    const state = get();
    const steps = Object.values(CheckoutStep);
    const currentIndex = steps.indexOf(state.step);
    
    if (currentIndex < steps.length - 1 && state.canProceedToNext()) {
      set({ step: steps[currentIndex + 1] });
    }
  },

  previousStep: () => {
    const state = get();
    const steps = Object.values(CheckoutStep);
    const currentIndex = steps.indexOf(state.step);
    
    if (currentIndex > 0) {
      set({ step: steps[currentIndex - 1] });
    }
  },

  canProceedToNext: () => {
    const state = get();
    
    switch (state.step) {
      case CheckoutStep.SHIPPING:
        return !!(state.email && state.shippingAddress);
      
      case CheckoutStep.PAYMENT:
        return !!(state.paymentMethod && (state.useSameAddress || state.billingAddress));
      
      case CheckoutStep.REVIEW:
        return true;
      
      default:
        return false;
    }
  },
}));