import { DriverWallet, WalletTransaction } from "./tipos";

const WALLET_STORAGE_KEY = "rf_driver_wallet";

export function loadDriverWallet(): DriverWallet {
  if (typeof window === "undefined") {
    return { balance: 0, cashInHand: 0, completedOrdersCount: 0, transactions: [] };
  }
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) {
      const initial: DriverWallet = {
        balance: 0,
        cashInHand: 0,
        completedOrdersCount: 0,
        transactions: [],
      };
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return { balance: 0, cashInHand: 0, completedOrdersCount: 0, transactions: [] };
  }
}

export function saveDriverWallet(wallet: DriverWallet) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
    window.dispatchEvent(new CustomEvent("rf-wallet-updated", { detail: wallet }));
  } catch (e) {
    console.warn("Error guardando cartera de repartidor:", e);
  }
}

/**
 * Acredita la ganancia del viaje al bolsillo del repartidor
 * y suma el efectivo cobrado en mano si fue contra entrega.
 */
export function creditDeliveryEarning(
  orderId: string,
  earningAmount: number,
  cashCollected: number = 0,
  description: string = "Entrega completada"
): DriverWallet {
  const current = loadDriverWallet();

  const newTx: WalletTransaction = {
    id: `tx-${Date.now().toString(36)}`,
    orderId,
    type: "earning",
    amount: earningAmount,
    description: `${description} #${orderId} (+$${earningAmount.toLocaleString("es-AR")})`,
    timestamp: new Date().toISOString(),
  };

  const updated: DriverWallet = {
    balance: current.balance + earningAmount,
    cashInHand: current.cashInHand + cashCollected,
    completedOrdersCount: current.completedOrdersCount + 1,
    transactions: [newTx, ...current.transactions],
  };

  saveDriverWallet(updated);
  return updated;
}

export function resetDriverWallet(): DriverWallet {
  const reset: DriverWallet = {
    balance: 0,
    cashInHand: 0,
    completedOrdersCount: 0,
    transactions: [],
  };
  saveDriverWallet(reset);
  return reset;
}
