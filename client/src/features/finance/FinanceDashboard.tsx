import { Plus } from "lucide-react";
import { toast } from "sonner";
import CategoriesView from "./components/CategoriesView";
import FinanceShell from "./components/FinanceShell";
import GlobalFilters from "./components/GlobalFilters";
import OverviewView from "./components/OverviewView";
import TransactionDialog from "./components/TransactionDialog";
import TransactionsView from "./components/TransactionsView";
import { useFinanceDashboard } from "./hooks/useFinanceDashboard";
import type { Transaction } from "./model/types";

export default function FinanceDashboard() {
  const { state, data, actions } = useFinanceDashboard();
  const title = state.view === "overview" ? "Visão geral" : state.view === "transactions" ? "Lançamentos" : "Categorias da casa";
  const subtitle = state.view === "overview"
    ? "O período da sua casa, em perspectiva."
    : state.view === "transactions"
      ? "Entradas e saídas organizadas em um só lugar."
      : "Veja como cada parte da rotina participa do orçamento.";

  const payTransaction = async (item: Transaction) => {
    if (!window.confirm(`Marcar “${item.description}” como pago? O valor entra nas despesas de hoje.`)) return;
    try {
      await actions.payTransaction(item);
      toast.success("Gasto marcado como pago. Ele entrou nas despesas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível marcar o gasto como pago.");
    }
  };

  const removeTransaction = async (item: Transaction) => {
    const confirmation = state.storageMode === "local"
      ? `Excluir permanentemente “${item.description}” deste computador?`
      : `Excluir “${item.description}” desta sessão?`;
    if (!window.confirm(confirmation)) return;
    try {
      await actions.deleteTransaction(item.id);
      toast.success(state.storageMode === "local" ? "Lançamento removido do banco local." : "Lançamento removido desta sessão.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o lançamento.");
    }
  };

  return <FinanceShell
    title={title}
    view={state.view}
    movementCount={data.scopedItems.length}
    mobileNavOpen={state.mobileNavOpen}
    onViewChange={actions.setView}
    onOpenMenu={() => actions.setMobileNavOpen(true)}
    onCloseMenu={() => actions.setMobileNavOpen(false)}
  >
    <div className="page-heading">
      <div><div className="page-kicker">SEU LAR, SEU RITMO</div><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="heading-actions"><button className="button button-primary new-transaction" disabled={state.storageMode === "checking" || state.storageMode === "error"} onClick={actions.openCreate}><Plus size={17} />Novo lançamento</button></div>
    </div>

    <GlobalFilters
      period={state.period}
      anchorDate={state.anchorDate}
      rangeLabel={data.rangeLabel}
      movementScope={state.movementScope}
      onPeriodChange={actions.setPeriod}
      onDateChange={actions.setPickerValue}
      onMovePeriod={actions.movePeriod}
      onScopeChange={actions.setMovementScope}
    />

    <div className={`storage-banner storage-banner-${state.storageMode}`} role={state.storageMode === "error" ? "alert" : "status"}>
      <span className="storage-dot" />
      <span>{state.storageMode === "local"
        ? <><strong>Modo local.</strong> Os dados estão salvos no banco deste computador.</>
        : state.storageMode === "demo"
          ? <><strong>Modo demonstração.</strong> Os dados são exemplos; alterações valem só enquanto esta página estiver aberta e não são salvas.</>
          : state.storageMode === "checking"
            ? <>Conferindo a conexão financeira…</>
            : <><strong>Banco local indisponível.</strong> {state.storageError}</>}</span>
      {state.storageMode === "error" && <button className="storage-retry" type="button" onClick={() => { void actions.retryStorage(); }}>Tentar novamente</button>}
    </div>

    {state.view === "overview" && <OverviewView
      period={state.period}
      rangeLabel={data.rangeLabel}
      movementScope={state.movementScope}
      transactions={data.scopedItems}
      totals={data.totals}
      heroValue={data.heroValue}
      heroLabel={data.heroLabel}
      heroStatus={data.heroStatus}
      flow={data.flow}
      breakdown={data.breakdown}
      breakdownType={data.breakdownType}
      breakdownTotal={data.breakdownTotal}
      categories={state.categories}
      onEdit={actions.openEdit}
      onRemove={removeTransaction}
      onPay={payTransaction}
      onSeeAll={() => actions.setView("transactions")}
    />}

    {state.view === "transactions" && <TransactionsView
      items={data.filteredItems}
      categories={state.categories}
      visibleCategories={data.visibleCategories}
      totals={data.filteredTotals}
      rangeLabel={data.rangeLabel}
      intervalCount={data.scopedItems.length}
      searchText={state.searchText}
      categoryFilter={state.categoryFilter}
      onSearchChange={actions.setSearchText}
      onCategoryChange={actions.setCategoryFilter}
      onEdit={actions.openEdit}
      onRemove={removeTransaction}
      onPay={payTransaction}
    />}

    {state.view === "categories" && <CategoriesView
      breakdown={data.breakdown}
      breakdownType={data.breakdownType}
      breakdownTotal={data.breakdownTotal}
      rangeLabel={data.rangeLabel}
      transactions={data.scopedItems}
      onAddTransaction={actions.openCreate}
    />}

    <TransactionDialog
      open={state.dialogOpen}
      initial={state.editing}
      defaultDate={data.dateForNewTransaction}
      defaultType={state.movementScope === "all" ? "expense" : state.movementScope}
      categories={state.categories}
      storageMode={state.storageMode}
      onAddCategory={actions.addCustomExpenseCategory}
      onClose={actions.closeDialog}
      onSave={actions.saveTransaction}
    />
  </FinanceShell>;
}
