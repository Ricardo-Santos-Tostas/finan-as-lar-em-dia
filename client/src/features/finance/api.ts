import type { FinanceCategory, Transaction, TransactionInput } from "./model/types";

export type LocalFinanceSnapshot =
  | { enabled: false }
  | { enabled: true; transactions: Transaction[]; categories: FinanceCategory[] };

const basePath = "/api/local-finance";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${basePath}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Não foi possível acessar o servidor financeiro local.");
  }

  const payload = await response.json().catch(() => null) as { error?: unknown } | null;
  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : "Não foi possível concluir a operação.";
    throw new Error(message);
  }
  return payload as T;
}

export async function loadLocalFinance(): Promise<LocalFinanceSnapshot> {
  let response: Response;
  try {
    response = await fetch(`${basePath}/state`, { headers: { Accept: "application/json" }, cache: "no-store" });
  } catch {
    return { enabled: false };
  }

  if (response.status === 404 || !response.headers.get("content-type")?.includes("application/json")) {
    return { enabled: false };
  }
  if (!response.ok) throw new Error("Não foi possível carregar o banco financeiro local.");
  return await response.json() as LocalFinanceSnapshot;
}

export const createLocalTransaction = (input: TransactionInput) =>
  requestJson<Transaction>("/transactions", { method: "POST", body: JSON.stringify(input) });

export const updateLocalTransaction = (id: string, input: TransactionInput) =>
  requestJson<Transaction>(`/transactions/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });

export const deleteLocalTransaction = (id: string) =>
  requestJson<{ success: true }>(`/transactions/${encodeURIComponent(id)}`, { method: "DELETE" });

export const createLocalCategory = (label: string) =>
  requestJson<FinanceCategory>("/categories", { method: "POST", body: JSON.stringify({ label }) });