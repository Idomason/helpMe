import { useQuery } from "@tanstack/react-query";

export interface WalletSummary {
  id: string;
  availableKobo: number;
  withdrawableKobo: number;
  committedKobo: number;
  available: number;
  withdrawable: number;
  committed: number;
  status: "active" | "frozen" | "closed";
}

export interface WalletEntry {
  id: string;
  entry_type: string;
  available_delta_kobo: number;
  withdrawable_delta_kobo: number;
  committed_delta_kobo: number;
  reference?: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  amount_kobo: number;
  fee_kobo: number;
  status: string;
  reference: string;
  created_at: string;
}

export interface WalletResponse {
  wallet: WalletSummary;
  recentEntries: WalletEntry[];
  recentWithdrawals: Withdrawal[];
  fees: { collectionPercent: number; collectionFlat: number; withdrawal: number };
  providerReady: boolean;
  disbursementsReady: boolean;
  providerMode: "sandbox" | "live";
}

export const useWallet = () => useQuery<WalletResponse>({
  queryKey: ["wallet"],
  queryFn: async () => {
    const response = await fetch("/api/v1/wallet", { credentials: "include" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "Could not load wallet");
    return body.data as WalletResponse;
  },
});

export const money = (kobo: number) => new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN", maximumFractionDigits: 2,
}).format(Number(kobo || 0) / 100);
