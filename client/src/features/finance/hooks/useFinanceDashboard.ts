import { useCallback, useEffect, useMemo, useState } from "react";
import { loadLocalFinance, createLocalCategory, createLocalTransaction, deleteLocalTransaction, updateLocalTransaction } from "../api";
import { categoryBreakdown, flowForPeriod, totalsFor } from "../model/calculations";
import { createCustomExpenseCategory } from "../model/categories";
import { CATEGORIES, DEMO_TRANSACTIONS } from "../model/demoData";
import { formatPeriodLabel, moveAnchorDate, normalizePickerValue, periodRange, todayKey, transactionsInRange } from "../model/dates";
import type { FinanceCategory, PeriodMode, Transaction, TransactionInput, TransactionType } from "../model/types";
import type { FinanceStorageMode, FinanceView, MovementScope } from "../types";

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useFinanceDashboard() {
  const [view, setView] = useState<FinanceView>("overview");
  const [period, setPeriod] = useState<PeriodMode>("month");
  const [anchorDate, setAnchorDate] = useState(todayKey);
  const [movementScope, setMovementScope] = useState<MovementScope>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>(CATEGORIES);
  const [storageMode, setStorageMode] = useState<FinanceStorageMode>("checking");
  const [storageError, setStorageError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const refreshStorage = useCallback(async () => {
    setStorageMode("checking");
    setStorageError("");
    try {
      const snapshot = await loadLocalFinance();
      if (snapshot.enabled) {
        setTransactions(snapshot.transactions);
        setCategories([...CATEGORIES, ...snapshot.categories]);
        setStorageMode("local");
      } else {
        setTransactions(DEMO_TRANSACTIONS);
        setCategories(CATEGORIES);
        setStorageMode("demo");
      }
    } catch {
      setTransactions([]);
      setStorageMode("error");
      setStorageError("Não foi possível carregar os dados do banco local. Verifique se os serviços estão ativos e tente novamente.");
    }
  }, []);

  useEffect(() => { void refreshStorage(); }, [refreshStorage]);

  const range = useMemo(() => periodRange(anchorDate, period), [anchorDate, period]);
  const rangeLabel = useMemo(() => formatPeriodLabel(range, period), [range, period]);
  const periodItems = useMemo(() => transactionsInRange(transactions, range), [transactions, range]);
  const scopedItems = useMemo(
    () => periodItems.filter((item) => movementScope === "all" || item.type === movementScope),
    [periodItems, movementScope],
  );
  const totals = useMemo(() => totalsFor(scopedItems), [scopedItems]);
  const flow = useMemo(() => flowForPeriod(scopedItems, period, range), [scopedItems, period, range]);
  const breakdownType: TransactionType = movementScope === "income" ? "income" : movementScope === "upcoming" ? "upcoming" : "expense";
  const breakdown = useMemo(() => categoryBreakdown(scopedItems, breakdownType, categories), [scopedItems, breakdownType, categories]);
  const filteredItems = useMemo(() => scopedItems
    .filter((item) => categoryFilter === "all" || item.categoryId === categoryFilter)
    .filter((item) => item.description.toLocaleLowerCase("pt-BR").includes(searchText.trim().toLocaleLowerCase("pt-BR")))
    .sort((a, b) => b.date.localeCompare(a.date)), [scopedItems, categoryFilter, searchText]);
  const filteredTotals = useMemo(() => totalsFor(filteredItems), [filteredItems]);
  const visibleCategories = useMemo(
    () => categories.filter((category) => movementScope === "all" || (movementScope === "upcoming" ? category.type === "expense" : category.type === movementScope)),
    [categories, movementScope],
  );

  const chooseScope = (scope: MovementScope) => {
    setMovementScope(scope);
    setCategoryFilter("all");
    setSearchText("");
  };
  const chooseView = (nextView: FinanceView) => {
    setView(nextView);
    setMobileNavOpen(false);
  };
  const setPickerValue = (value: string) => {
    const normalizedDate = normalizePickerValue(value, period);
    if (normalizedDate) setAnchorDate(normalizedDate);
  };
  const movePeriod = (offset: number) => setAnchorDate((value) => moveAnchorDate(value, period, offset));
  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (item: Transaction) => { setEditing(item); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const saveTransaction = async (input: TransactionInput) => {
    if (storageMode === "local") {
      const saved = editing
        ? await updateLocalTransaction(editing.id, input)
        : await createLocalTransaction(input);
      setTransactions((items) => editing ? items.map((item) => item.id === editing.id ? saved : item) : [saved, ...items]);
    } else if (storageMode === "demo") {
      if (editing) setTransactions((items) => items.map((item) => item.id === editing.id ? { ...input, id: editing.id } : item));
      else setTransactions((items) => [{ ...input, id: makeId() }, ...items]);
    } else {
      throw new Error(storageError || "Aguarde a conexão com o modo financeiro.");
    }
    closeDialog();
  };

  const deleteTransaction = async (id: string) => {
    if (storageMode === "local") await deleteLocalTransaction(id);
    else if (storageMode !== "demo") throw new Error(storageError || "Aguarde a conexão com o modo financeiro.");
    setTransactions((items) => items.filter((item) => item.id !== id));
  };

  const payTransaction = async (item: Transaction) => {
    if (item.type !== "upcoming") return item;
    const paid: TransactionInput = {
      description: item.description,
      amount: item.amount,
      type: "expense",
      categoryId: item.categoryId,
      date: todayKey(),
    };
    if (storageMode === "local") {
      const saved = await updateLocalTransaction(item.id, paid);
      setTransactions((items) => items.map((current) => current.id === item.id ? saved : current));
      return saved;
    }
    if (storageMode !== "demo") throw new Error(storageError || "Aguarde a conexão com o modo financeiro.");
    const saved = { ...item, ...paid };
    setTransactions((items) => items.map((current) => current.id === item.id ? saved : current));
    return saved;
  };

  const addCustomExpenseCategory = async (label: string) => {
    if (storageMode !== "demo" && storageMode !== "local") throw new Error(storageError || "Aguarde a conexão com o modo financeiro.");
    if (categories.some((category) => category.type === "expense" && category.label.toLocaleLowerCase("pt-BR") === label.trim().toLocaleLowerCase("pt-BR"))) return null;
    const category = storageMode === "local"
      ? await createLocalCategory(label.trim())
      : createCustomExpenseCategory(label, categories);
    if (!category) return null;
    setCategories((items) => [...items, category]);
    return category;
  };

  const heroValue = movementScope === "all" ? totals.balance : movementScope === "income" ? totals.income : movementScope === "upcoming" ? totals.upcoming : totals.expenses;
  const heroLabel = movementScope === "all" ? "Saldo do período" : movementScope === "income" ? "Total de entradas" : movementScope === "upcoming" ? "Gastos futuros" : "Total de despesas";
  const heroStatus = movementScope === "all"
    ? totals.balance >= 0 ? "Um bom ritmo para a casa" : "As despesas passaram das receitas"
    : movementScope === "income" ? "Entradas no intervalo selecionado" : movementScope === "upcoming" ? "Ainda não saíram da conta" : "Despesas no intervalo selecionado";
  const breakdownTotal = breakdownType === "income" ? totals.income : breakdownType === "upcoming" ? totals.upcoming : totals.expenses;
  const dateForNewTransaction = period === "month" || period === "year" ? range.start : anchorDate;

  return {
    state: { view, period, anchorDate, movementScope, transactions, categories, storageMode, storageError, dialogOpen, editing, searchText, categoryFilter, mobileNavOpen },
    data: { range, rangeLabel, periodItems, scopedItems, totals, flow, breakdownType, breakdown, filteredItems, filteredTotals, visibleCategories, heroValue, heroLabel, heroStatus, breakdownTotal, dateForNewTransaction },
    actions: {
      setView: chooseView,
      setPeriod,
      setMovementScope: chooseScope,
      setSearchText,
      setCategoryFilter,
      setMobileNavOpen,
      setPickerValue,
      movePeriod,
      retryStorage: refreshStorage,
      openCreate,
      openEdit,
      closeDialog,
      saveTransaction,
      deleteTransaction,
      payTransaction,
      addCustomExpenseCategory,
    },
  };
}

export type FinanceDashboardState = ReturnType<typeof useFinanceDashboard>;
