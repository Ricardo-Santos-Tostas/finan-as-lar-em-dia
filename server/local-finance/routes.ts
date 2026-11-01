import { Router, type Request, type Response } from "express";
import { categoryFitsTransaction, createCustomExpenseCategory } from "../../client/src/features/finance/model/categories";
import { CATEGORIES } from "../../client/src/features/finance/model/demoData";
import { localFinanceDatabaseEnabled } from "./database";
import {
  createLocalCategory,
  createLocalTransaction,
  deleteLocalTransaction,
  listLocalCategories,
  listLocalTransactions,
  updateLocalTransaction,
} from "./repository";
import { categoryInputSchema, transactionIdSchema, transactionInputSchema } from "./validation";

type AsyncHandler = (req: Request, res: Response) => Promise<void>;
const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response) => {
  void handler(req, res).catch((error: unknown) => {
    console.error("[Local finance] Request failed:", error instanceof Error ? error.message : "unknown error");
    if (!res.headersSent) res.status(500).json({ error: "Não foi possível concluir a operação no banco local." });
  });
};

const invalidBodyMessage = (issues: { message: string }[]) => issues[0]?.message ?? "Os dados enviados são inválidos.";

export const localFinanceRouter = Router();
localFinanceRouter.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

localFinanceRouter.get("/state", asyncRoute(async (_req, res) => {
  if (!localFinanceDatabaseEnabled()) {
    res.json({ enabled: false });
    return;
  }
  const [transactions, categories] = await Promise.all([listLocalTransactions(), listLocalCategories()]);
  res.json({ enabled: true, transactions, categories });
}));

localFinanceRouter.post("/transactions", asyncRoute(async (req, res) => {
  if (!localFinanceDatabaseEnabled()) return void res.status(503).json({ error: "O banco financeiro local não está configurado." });
  const parsed = transactionInputSchema.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: invalidBodyMessage(parsed.error.issues) });
  const categories = [...CATEGORIES, ...await listLocalCategories()];
  const category = categories.find((item) => item.id === parsed.data.categoryId && categoryFitsTransaction(item, parsed.data.type));
  if (!category) return void res.status(400).json({ error: "A categoria não corresponde ao tipo deste lançamento." });
  res.status(201).json(await createLocalTransaction(parsed.data));
}));

localFinanceRouter.put("/transactions/:id", asyncRoute(async (req, res) => {
  if (!localFinanceDatabaseEnabled()) return void res.status(503).json({ error: "O banco financeiro local não está configurado." });
  const parsedId = transactionIdSchema.safeParse(req.params.id);
  if (!parsedId.success) return void res.status(400).json({ error: "Identificador inválido." });
  const parsed = transactionInputSchema.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: invalidBodyMessage(parsed.error.issues) });
  const categories = [...CATEGORIES, ...await listLocalCategories()];
  if (!categories.some((item) => item.id === parsed.data.categoryId && categoryFitsTransaction(item, parsed.data.type))) {
    return void res.status(400).json({ error: "A categoria não corresponde ao tipo deste lançamento." });
  }
  const updated = await updateLocalTransaction(parsedId.data, parsed.data);
  if (!updated) return void res.status(404).json({ error: "Lançamento não encontrado." });
  res.json(updated);
}));

localFinanceRouter.delete("/transactions/:id", asyncRoute(async (req, res) => {
  if (!localFinanceDatabaseEnabled()) return void res.status(503).json({ error: "O banco financeiro local não está configurado." });
  const parsedId = transactionIdSchema.safeParse(req.params.id);
  if (!parsedId.success) return void res.status(400).json({ error: "Identificador inválido." });
  if (!await deleteLocalTransaction(parsedId.data)) return void res.status(404).json({ error: "Lançamento não encontrado." });
  res.json({ success: true });
}));

localFinanceRouter.post("/categories", asyncRoute(async (req, res) => {
  if (!localFinanceDatabaseEnabled()) return void res.status(503).json({ error: "O banco financeiro local não está configurado." });
  const parsed = categoryInputSchema.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: invalidBodyMessage(parsed.error.issues) });
  const categories = [...CATEGORIES, ...await listLocalCategories()];
  const category = createCustomExpenseCategory(parsed.data.label, categories);
  if (!category) return void res.status(409).json({ error: "Já existe uma categoria de despesa com esse nome." });
  try {
    res.status(201).json(await createLocalCategory(category));
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    if (code === "ER_DUP_ENTRY") return void res.status(409).json({ error: "Já existe uma categoria de despesa com esse nome." });
    throw error;
  }
}));
