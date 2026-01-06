import { z } from "zod";

export const CreateLoanApplicationInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  amount: z.number().positive().max(10_000_000),
  termMonths: z.number().int().positive().max(480),
  purpose: z.string().trim().min(3).max(1000),
});

export const UpdateLoanApplicationInputSchema = CreateLoanApplicationInputSchema.partial().extend({
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
});
