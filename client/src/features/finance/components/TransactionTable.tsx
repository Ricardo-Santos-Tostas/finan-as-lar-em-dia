import { ArrowDownRight, ArrowUpRight, ChevronRight, Clock, Pencil, Search, Trash2 } from "lucide-react";
import { categoryById } from "../model/categories";
import { currency } from "../model/calculations";
import { formatDate } from "../model/dates";
import type { FinanceCategory, Transaction } from "../model/types";

type Props = {
  items: Transaction[];
  categories: FinanceCategory[];
  onEdit: (item: Transaction) => void;
  onRemove: (item: Transaction) => void;
  onPay?: (item: Transaction) => void;
  heading?: string;
  caption?: string;
  onSeeAll?: () => void;
  compact?: boolean;
};

export default function TransactionTable({ items, categories, onEdit, onRemove, onPay, heading, caption, onSeeAll, compact = false }: Props) {
  return <section className={`panel recent-panel ${compact ? "compact-table" : ""}`}>
    {!compact && <div className="panel-heading recent-heading">
      <div><span className="eyebrow">NO SEU DIA A DIA</span><h2>{heading}</h2><p>{caption}</p></div>
      {onSeeAll && <button className="text-button" onClick={onSeeAll}>Ver todos <ChevronRight size={16} /></button>}
    </div>}
    <div className="table-scroll"><table className="transactions-table">
      <thead><tr><th>DESCRIÇÃO</th><th>DATA</th><th>CATEGORIA</th><th className="amount-col">VALOR</th><th className="actions-col"><span className="visually-hidden">Ações</span></th></tr></thead>
      <tbody>
        {items.length ? items.map((item) => {
          const category = categoryById(item.categoryId, categories);
          return <tr key={item.id}>
            <td><div className="transaction-description"><span className={`transaction-type-icon ${item.type === "income" ? "type-income" : item.type === "upcoming" ? "type-upcoming" : "type-expense"}`}>{item.type === "income" ? <ArrowDownRight size={16} /> : item.type === "upcoming" ? <Clock size={16} /> : <ArrowUpRight size={16} />}</span><strong>{item.description}</strong></div></td>
            <td className="date-cell">{formatDate(item.date)}</td>
            <td><span className="category-pill"><i className="legend-dot" style={{ background: category.color }} />{category.label}</span></td>
            <td className={`amount-cell ${item.type === "income" ? "amount-positive" : item.type === "upcoming" ? "amount-upcoming" : ""}`}>{item.type === "income" ? "+" : item.type === "upcoming" ? "" : "−"} {currency(item.amount)}</td>
            <td><div className="row-tools">{item.type === "upcoming" && onPay && <button className="pay-button" type="button" onClick={() => onPay(item)}>Marcar como pago</button>}<div className="row-actions"><button className="row-action" onClick={() => onEdit(item)} aria-label={`Editar ${item.description}`} title="Editar"><Pencil size={15} /></button><button className="row-action delete-action" onClick={() => onRemove(item)} aria-label={`Excluir ${item.description}`} title="Excluir"><Trash2 size={15} /></button></div></div></td>
          </tr>;
        }) : <tr><td colSpan={5}><div className="table-empty"><Search size={18} /><span>Nenhum lançamento encontrado neste período.</span></div></td></tr>}
      </tbody>
    </table></div>
  </section>;
}
