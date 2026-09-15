import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Check, ChevronsUpDown, LoaderCircle, Save, Landmark, Search, ShieldCheck, X } from "lucide-react";
import { useMyBankAccount, useBanks } from "../../hooks/useEscrow";

export default function PayoutSettings({ compact = false, providerReady = true }: { compact?: boolean; providerReady?: boolean }) {
  const queryClient = useQueryClient();
  const { data: existing } = useMyBankAccount();
  const { data: banks, isLoading: banksLoading } = useBanks(providerReady);

  const [form, setForm] = useState({
    accountNumber: "",
    bankCode: "",
    bankName: "",
  });
  const [bankOpen, setBankOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const bankPickerRef = useRef<HTMLDivElement>(null);

  const bankOptions = useMemo(() => {
    const unique = new Map<string, { name: string; code: string }>();
    for (const bank of banks || []) {
      const key = `${bank.code}:${bank.name.trim().toLowerCase()}`;
      if (!unique.has(key)) unique.set(key, bank);
    }
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [banks]);

  const selectedBank = bankOptions.find((bank) => bank.code === form.bankCode);
  const filteredBanks = useMemo(() => {
    const query = bankSearch.trim().toLowerCase();
    if (!query) return bankOptions;
    return bankOptions.filter((bank) =>
      bank.name.toLowerCase().includes(query) || bank.code.toLowerCase().includes(query),
    );
  }, [bankOptions, bankSearch]);

  useEffect(() => {
    if (existing) {
      setForm({
        accountNumber: existing.account_number,
        bankCode: existing.bank_code,
        bankName: existing.bank_name || "",
      });
    }
  }, [existing]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!bankPickerRef.current?.contains(event.target as Node)) setBankOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const { mutate: save, isLoading } = useMutation({
    mutationFn: async () => {
      const bankName = banks?.find((b) => b.code === form.bankCode)?.name || form.bankName;
      const res = await fetch("/api/v1/payments/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accountNumber: form.accountNumber, bankCode: form.bankCode, bankName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Payout account verified and saved");
      queryClient.invalidateQueries({ queryKey: ["myBankAccount"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${compact ? "p-4 sm:p-5" : "p-6 sm:p-8"}`}>
      <div className="mb-1 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-helpMe-700"><Landmark className="h-4.5 w-4.5" /></span>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-950">Payout account</h3>
          <p className="text-xs text-gray-500">For rewards and eligible refunds</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Account number</label>
            <input
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="0123456789"
              inputMode="numeric"
              autoComplete="off"
              disabled={!providerReady}
            />
          </div>
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Bank</label>
          {bankOptions.length > 0 ? (
            <div ref={bankPickerRef} className="relative">
              <button
                type="button"
                role="combobox"
                aria-label="Bank"
                aria-expanded={bankOpen}
                aria-controls="bank-options"
                onClick={() => setBankOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setBankOpen(false);
                  if (event.key === "ArrowDown") setBankOpen(true);
                }}
                className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-left text-sm outline-none transition hover:border-purple-200 hover:bg-white focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
              >
                <span className={`truncate ${selectedBank ? "font-medium text-gray-900" : "text-gray-400"}`}>
                  {selectedBank?.name || form.bankName || "Select your bank"}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
              </button>

              {bankOpen && (
                <>
                <button type="button" aria-label="Close bank list" onClick={() => setBankOpen(false)} className="fixed inset-0 z-40 bg-gray-950/35 backdrop-blur-[1px] sm:hidden" />
                <div className="dashboard-mobile-sheet fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_50px_-15px_rgba(35,8,65,0.28)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:w-full sm:min-w-[16rem]">
                  <div className="border-b border-gray-100 p-2.5">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        autoFocus
                        value={bankSearch}
                        onChange={(event) => setBankSearch(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            setBankOpen(false);
                            setBankSearch("");
                          }
                          if (event.key === "Enter" && filteredBanks.length === 1) {
                            const bank = filteredBanks[0];
                            setForm({ ...form, bankCode: bank.code, bankName: bank.name });
                            setBankOpen(false);
                            setBankSearch("");
                          }
                        }}
                        placeholder="Search bank name"
                        aria-label="Search banks"
                        className="h-10 w-full rounded-xl bg-gray-50 pl-9 pr-9 text-sm text-gray-900 outline-none ring-1 ring-inset ring-gray-200 transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-helpMe-500/25"
                      />
                      {bankSearch && (
                        <button type="button" aria-label="Clear bank search" onClick={() => setBankSearch("")} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div id="bank-options" role="listbox" aria-label="Banks" className="max-h-56 overflow-y-auto overscroll-contain p-1.5">
                    {filteredBanks.length > 0 ? filteredBanks.map((bank) => {
                      const isSelected = bank.code === form.bankCode;
                      return (
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          key={`${bank.code}-${bank.name}`}
                          onClick={() => {
                            setForm({ ...form, bankCode: bank.code, bankName: bank.name });
                            setBankOpen(false);
                            setBankSearch("");
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500/30 ${isSelected ? "bg-purple-50 font-semibold text-helpMe-800" : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"}`}
                        >
                          <span className="min-w-0 truncate">{bank.name}</span>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-helpMe-700" />}
                        </button>
                      );
                    }) : (
                      <div className="px-3 py-8 text-center">
                        <p className="text-sm font-semibold text-gray-800">No bank found</p>
                        <p className="mt-1 text-xs text-gray-500">Try a different name.</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-400">
                    {filteredBanks.length} {filteredBanks.length === 1 ? "bank" : "banks"}
                  </div>
                </div>
                </>
              )}
            </div>
          ) : (
            <input
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              value={form.bankCode}
              onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
              placeholder={providerReady ? (banksLoading ? "Loading banks…" : "Bank code") : "Available after sandbox setup"}
              disabled={!providerReady || banksLoading}
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {existing?.account_name_verified ? (
          <div className="flex min-w-0 items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <BadgeCheck className="h-4 w-4 shrink-0" /><span className="truncate">{existing.account_name}</span>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-gray-500"><ShieldCheck className="h-4 w-4" />Monnify confirms the account name.</p>
        )}
        <button
          onClick={() => save()}
          disabled={!providerReady || isLoading || form.accountNumber.length !== 10 || !form.bankCode}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-4 text-xs font-bold text-white transition hover:bg-helpMe-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Verify & save
        </button>
      </div>
    </section>
  );
}
