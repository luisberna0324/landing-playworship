import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Billing = 'monthly' | 'annual';

interface BillingContextValue {
  billing: Billing;
  setBilling: (b: Billing) => void;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [billing, setBilling] = useState<Billing>('monthly');
  const value = useMemo(() => ({ billing, setBilling }), [billing]);
  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling debe usarse dentro de BillingProvider');
  return ctx;
}
