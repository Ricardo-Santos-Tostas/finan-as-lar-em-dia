import type { FinanceCategory, Transaction } from "./types";

export const CATEGORIES: FinanceCategory[] = [
  { id: "home", label: "Casa", type: "expense", color: "#829875", icon: "⌂" },
  { id: "food", label: "Alimentação", type: "expense", color: "#d6a15d", icon: "◒" },
  { id: "child", label: "Criança", type: "expense", color: "#c7858b", icon: "✿" },
  { id: "pet", label: "Pet", type: "expense", color: "#9a82b0", icon: "♡" },
  { id: "moto", label: "Moto", type: "expense", color: "#6d8f9a", icon: "↗" },
  { id: "health", label: "Saúde", type: "expense", color: "#86a9a0", icon: "+" },
  { id: "transport", label: "Transporte", type: "expense", color: "#8c96b0", icon: "⇄" },
  { id: "leisure", label: "Lazer", type: "expense", color: "#c68d68", icon: "✦" },
  { id: "other-expense", label: "Outros", type: "expense", color: "#9da5a1", icon: "···" },
  { id: "salary", label: "Salário", type: "income", color: "#477a67", icon: "↙" },
  { id: "extra-income", label: "Renda extra", type: "income", color: "#72a18b", icon: "✳" },
  { id: "other-income", label: "Outras receitas", type: "income", color: "#9ab29c", icon: "+" },
];

const today = new Date();
const demoMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
const demoDate = (day: number) => `${demoMonth}-${String(day).padStart(2, "0")}`;

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "demo-01", description: "Salário", amount: 6800, type: "income", categoryId: "salary", date: demoDate(5) },
  { id: "demo-02", description: "Aluguel", amount: 1850, type: "expense", categoryId: "home", date: demoDate(3) },
  { id: "demo-03", description: "Mercado da semana", amount: 685.4, type: "expense", categoryId: "food", date: demoDate(8) },
  { id: "demo-04", description: "Material escolar", amount: 248.9, type: "expense", categoryId: "child", date: demoDate(11) },
  { id: "demo-05", description: "Ração e petiscos", amount: 186.5, type: "expense", categoryId: "pet", date: demoDate(13) },
  { id: "demo-06", description: "Manutenção da moto", amount: 350, type: "expense", categoryId: "moto", date: demoDate(15) },
  { id: "demo-07", description: "Renda extra", amount: 750, type: "income", categoryId: "extra-income", date: demoDate(17) },
  { id: "demo-08", description: "Conta de luz e água", amount: 278.3, type: "expense", categoryId: "home", date: demoDate(19) },
  { id: "demo-09", description: "Consulta pediátrica", amount: 160, type: "expense", categoryId: "health", date: demoDate(21) },
  { id: "demo-10", description: "Passeio em família", amount: 210, type: "expense", categoryId: "leisure", date: demoDate(24) },
  { id: "demo-11", description: "Combustível", amount: 180, type: "expense", categoryId: "moto", date: demoDate(26) },
  { id: "demo-12", description: "Internet a pagar", amount: 120, type: "upcoming", categoryId: "home", date: demoDate(28) },
];
