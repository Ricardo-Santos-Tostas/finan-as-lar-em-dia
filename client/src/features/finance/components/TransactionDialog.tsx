import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { FinanceCategory, Transaction, TransactionInput, TransactionType } from "../model/types";
import type { FinanceStorageMode } from "../types";

type Props = {
  open: boolean;
  initial?: Transaction | null;
  defaultDate: string;
  defaultType: TransactionType;
  categories: FinanceCategory[];
  storageMode: FinanceStorageMode;
  onAddCategory: (label: string) => Promise<FinanceCategory | null>;
  onClose: () => void;
  onSave: (input: TransactionInput) => Promise<void>;
};

export default function TransactionDialog({ open, initial, defaultDate, defaultType, categories, storageMode, onAddCategory, onClose, onSave }: Props) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? defaultType);
  const availableCategories = useMemo(() => categories.filter((category) => category.type === type), [categories, type]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? defaultType);
    setDescription(initial?.description ?? "");
    setAmount(initial ? String(initial.amount) : "");
    setCategoryId(initial?.categoryId ?? "");
    setDate(initial?.date ?? defaultDate);
    setError("");
    setSaving(false);
    setShowCategoryCreator(false);
    setNewCategoryLabel("");
    setCategoryError("");
    setCategorySaving(false);
  }, [open, initial, defaultDate, defaultType]);

  useEffect(() => {
    if (availableCategories.length && !availableCategories.some((category) => category.id === categoryId)) {
      setCategoryId(availableCategories[0].id);
    }
  }, [availableCategories, categoryId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !saving) onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, saving]);

  if (!open) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const numericAmount = Number(amount.replace(",", "."));
    if (!description.trim()) return setError("Dê um nome para este lançamento.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setError("Informe um valor maior que zero.");
    if (!date || Number.isNaN(new Date(`${date}T12:00:00`).getTime())) return setError("Escolha uma data válida.");
    if (!availableCategories.some((category) => category.id === categoryId)) return setError("Escolha uma categoria para este lançamento.");
    setSaving(true);
    setError("");
    try {
      await onSave({ description: description.trim(), amount: numericAmount, type, categoryId, date });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o lançamento.");
    } finally {
      setSaving(false);
    }
  };

  const addExpenseCategory = async () => {
    const label = newCategoryLabel.trim();
    if (!label) return setCategoryError("Digite o nome da categoria.");
    if (categories.some((category) => category.type === "expense" && category.label.toLocaleLowerCase("pt-BR") === label.toLocaleLowerCase("pt-BR"))) {
      return setCategoryError("Já existe uma categoria de despesa com esse nome.");
    }
    setCategorySaving(true);
    setCategoryError("");
    try {
      const category = await onAddCategory(label);
      if (!category) return setCategoryError("Não foi possível adicionar a categoria.");
      setCategoryId(category.id);
      setNewCategoryLabel("");
      setShowCategoryCreator(false);
    } catch (categorySaveError) {
      setCategoryError(categorySaveError instanceof Error ? categorySaveError.message : "Não foi possível salvar a categoria.");
    } finally {
      setCategorySaving(false);
    }
  };

  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <section className="transaction-dialog" role="dialog" aria-modal="true" aria-labelledby="transaction-dialog-title">
      <div className="dialog-heading">
        <div><span className="eyebrow">MOVIMENTAÇÃO DA CASA</span><h2 id="transaction-dialog-title">{initial ? "Editar lançamento" : "Novo lançamento"}</h2></div>
        <button className="icon-button" type="button" onClick={onClose} disabled={saving} aria-label="Fechar formulário"><X size={19} /></button>
      </div>
      <form onSubmit={(event) => { void submit(event); }}>
        <div className="type-switch" role="group" aria-label="Tipo de lançamento">
          <button className={type === "expense" ? "type-option active expense-active" : "type-option"} type="button" disabled={saving} onClick={() => setType("expense")}>Despesa</button>
          <button className={type === "income" ? "type-option active income-active" : "type-option"} type="button" disabled={saving} onClick={() => setType("income")}>Receita</button>
        </div>
        <label className="field-label" htmlFor="transaction-description">Descrição</label>
        <input id="transaction-description" className="form-control" autoFocus value={description} onChange={(event) => setDescription(event.target.value)} placeholder={type === "expense" ? "Ex.: Mercado do mês" : "Ex.: Salário"} maxLength={80} disabled={saving} />
        <div className="form-row">
          <div className="form-field"><label className="field-label" htmlFor="transaction-amount">Valor</label><div className="amount-input-wrap"><span>R$</span><input id="transaction-amount" className="form-control" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" disabled={saving} /></div></div>
          <div className="form-field"><label className="field-label" htmlFor="transaction-date">Data</label><input id="transaction-date" className="form-control" type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={saving} /></div>
        </div>
        <label className="field-label" htmlFor="transaction-category">Categoria</label>
        <select id="transaction-category" className="form-control" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={saving}>
          {availableCategories.map((category) => <option value={category.id} key={category.id}>{category.icon}　{category.label}</option>)}
        </select>
        {type === "expense" && <div className="custom-category-area">
          {showCategoryCreator ? <div className="custom-category-form">
            <label className="field-label" htmlFor="custom-expense-category">Nova categoria de despesa</label>
            <div className="custom-category-input-row"><input id="custom-expense-category" className="form-control" autoComplete="off" maxLength={32} value={newCategoryLabel} onChange={(event) => setNewCategoryLabel(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void addExpenseCategory(); } }} placeholder="Ex.: Jardinagem" disabled={categorySaving} /><button className="button button-primary custom-category-add" type="button" onClick={() => { void addExpenseCategory(); }} disabled={categorySaving}>{categorySaving ? "Salvando..." : "Adicionar"}</button></div>
            {categoryError && <p className="form-error category-error" role="alert">{categoryError}</p>}
            <button className="custom-category-cancel" type="button" disabled={categorySaving} onClick={() => { setShowCategoryCreator(false); setCategoryError(""); }}>Cancelar</button>
          </div> : <button className="add-category-link" type="button" disabled={saving} onClick={() => setShowCategoryCreator(true)}>＋ Criar categoria de despesa</button>}
        </div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-footnote">{storageMode === "local" ? "Este lançamento será salvo no banco de dados deste computador." : "Este lançamento fica apenas nesta sessão e será descartado ao recarregar."}</div>
        <div className="dialog-actions"><button className="button button-quiet" type="button" disabled={saving} onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Salvando..." : initial ? "Salvar alteração" : "Adicionar lançamento"}</button></div>
      </form>
    </section>
  </div>;
}
