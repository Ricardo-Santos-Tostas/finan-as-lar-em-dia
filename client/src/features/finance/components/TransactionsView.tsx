import { Search, SlidersHorizontal, X } from "lucide-react";
import TransactionTable from "./TransactionTable";
import { currency } from "../model/calculations";
import type { FinanceCategory, Transaction } from "../model/types";

type Totals = { income: number; expenses: number; upcoming: number; balance: number };
type Props = {
  items: Transaction[];
  categories: FinanceCategory[];
  visibleCategories: FinanceCategory[];
  totals: Totals;
  rangeLabel: string;
  intervalCount: number;
  searchText: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onEdit: (item: Transaction) => void;
  onRemove: (item: Transaction) => void;
  onPay: (item: Transaction) => void;
};

export default function TransactionsView({ items, categories, visibleCategories, totals, rangeLabel, intervalCount, searchText, categoryFilter, onSearchChange, onCategoryChange, onEdit, onRemove, onPay }: Props) {
  return <section className="panel transactions-panel">
    <div className="panel-heading transactions-heading">
      <div><span className="eyebrow">HISTÓRICO DA CASA</span><h2>Movimentações</h2><p>{items.length} resultado(s) · {intervalCount} no intervalo de {rangeLabel}</p></div>
      <div className="filtered-summary" aria-label="Resumo dos resultados filtrados">
        <div><span>Entradas</span><strong>{currency(totals.income)}</strong></div>
        <div><span>Despesas</span><strong>{currency(totals.expenses)}</strong></div>
        <div><span>Futuros</span><strong>{currency(totals.upcoming)}</strong></div>
        <div><span>Saldo</span><strong className={totals.balance < 0 ? "summary-negative" : ""}>{currency(totals.balance)}</strong></div>
      </div>
    </div>
    <div className="filter-bar">
      <label className="search-box"><Search size={17} /><input aria-label="Buscar lançamento" value={searchText} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar lançamento..." />{searchText && <button className="clear-search" onClick={() => onSearchChange("")} aria-label="Limpar busca"><X size={14} /></button>}</label>
      <label className="filter-select category-filter"><SlidersHorizontal size={16} /><select aria-label="Filtrar categoria" value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value)}><option value="all">Todas as categorias</option>{visibleCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label>
    </div>
    <TransactionTable items={items} categories={categories} onEdit={onEdit} onRemove={onRemove} onPay={onPay} compact />
  </section>;
}
