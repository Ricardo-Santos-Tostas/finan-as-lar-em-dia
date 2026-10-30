import type { TransactionType } from "./model/types";

export type FinanceView = "overview" | "transactions" | "categories";
export type MovementScope = "all" | TransactionType;
export type FinanceStorageMode = "checking" | "demo" | "local" | "error";
