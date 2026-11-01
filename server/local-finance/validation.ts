import { z } from "zod";

const validDateKey = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const hasAtMostTwoDecimalPlaces = (value: number) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;

export const transactionInputSchema = z.object({
  description: z.string().trim().min(1, "Informe uma descrição.").max(80, "A descrição pode ter até 80 caracteres."),
  amount: z.number()
    .finite()
    .positive("O valor precisa ser maior que zero.")
    .max(9_999_999_999)
    .refine((value) => Math.round(value * 100) > 0, "O valor mínimo é R$ 0,01.")
    .refine(hasAtMostTwoDecimalPlaces, "Use no máximo duas casas decimais."),
  type: z.enum(["income", "expense", "upcoming"]),
  categoryId: z.string().min(1).max(128),
  date: z.string().refine(validDateKey, "Informe uma data válida."),
}).strict();

export const categoryInputSchema = z.object({
  label: z.string().trim().min(1, "Digite o nome da categoria.").max(32, "O nome pode ter até 32 caracteres."),
}).strict();

export const transactionIdSchema = z.string().uuid();
