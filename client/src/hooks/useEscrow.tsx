import { useQuery } from "@tanstack/react-query";

export type EscrowStatus =
  | "pending"
  | "held"
  | "releasing"
  | "released"
  | "refunding"
  | "refunded"
  | "disputed"
  | "failed";

export interface Escrow {
  _id: string;
  reference: string;
  funderId: string;
  beneficiaryId: string;
  requestId?: string;
  giveawayId?: string;
  purpose: "request" | "giveaway";
  amount: number;
  currency: string;
  provider?: "wallet" | "paystack" | "monnify";
  amountKobo?: number;
  status: EscrowStatus;
  authorizationUrl?: string;
  message?: string | null;
  isAnonymous?: boolean;
  funder?: { _id: string; name: string } | null;
  createdAt: string;
  heldAt?: string;
  releasedAt?: string;
}

export const useMyEscrows = () =>
  useQuery<Escrow[]>({
    queryKey: ["myEscrows"],
    queryFn: async () => {
      const res = await fetch("/api/v1/escrow/mine", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load escrows");
      const data = await res.json();
      return data.data as Escrow[];
    },
  });

export const useRequestEscrow = (requestId?: string) =>
  useQuery<Escrow[]>({
    queryKey: ["requestEscrow", requestId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/escrow/request/${requestId}`);
      if (!res.ok) throw new Error("Failed to load escrow");
      const data = await res.json();
      return data.data as Escrow[];
    },
    enabled: !!requestId,
  });

export interface RequestFundingSummary {
  raised: number;
  contributors: number;
  donors: Escrow[];
}

export const useRequestFundingSummary = (requestId?: string) =>
  useQuery<RequestFundingSummary>({
    queryKey: ["requestFundingSummary", requestId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/escrow/request/${requestId}/summary`);
      if (!res.ok) throw new Error("Failed to load funding summary");
      const data = await res.json();
      return data.data as RequestFundingSummary;
    },
    enabled: !!requestId,
  });

export interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name?: string;
  is_default: boolean;
  account_name_verified?: boolean;
}

export const useMyBankAccount = () =>
  useQuery<BankAccount | null>({
    queryKey: ["myBankAccount"],
    queryFn: async () => {
      const res = await fetch("/api/v1/payments/bank-account", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load bank account");
      const data = await res.json();
      return data.data as BankAccount | null;
    },
  });

export interface Bank {
  name: string;
  code: string;
}

export const useBanks = (enabled = true) =>
  useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: async () => {
      const res = await fetch("/api/v1/payments/banks", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load banks");
      const data = await res.json();
      return data.data as Bank[];
    },
    enabled,
    staleTime: 60 * 60_000,
  });
