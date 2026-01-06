import { createSchema } from "graphql-yoga";
import { prisma } from "@/lib/prisma";
import { CreateLoanApplicationInputSchema, UpdateLoanApplicationInputSchema } from "./validators";

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    enum LoanStatus {
      DRAFT
      SUBMITTED
      APPROVED
      REJECTED
    }

    type LoanApplication {
      id: ID!
      fullName: String!
      email: String!
      amount: Float!
      termMonths: Int!
      purpose: String!
      status: LoanStatus!
      createdAt: String!
      updatedAt: String!
    }

    input CreateLoanApplicationInput {
      fullName: String!
      email: String!
      amount: Float!
      termMonths: Int!
      purpose: String!
    }

    input UpdateLoanApplicationInput {
      fullName: String
      email: String
      amount: Float
      termMonths: Int
      purpose: String
      status: LoanStatus
    }

    type Query {
      loanApplications(limit: Int = 50, offset: Int = 0): [LoanApplication!]!
      loanApplication(id: ID!): LoanApplication
    }

    type Mutation {
      createLoanApplication(input: CreateLoanApplicationInput!): LoanApplication!
      updateLoanApplication(id: ID!, input: UpdateLoanApplicationInput!): LoanApplication
      deleteLoanApplication(id: ID!): Boolean!

      submitLoanApplication(id: ID!): LoanApplication
      approveLoanApplication(id: ID!): LoanApplication
      rejectLoanApplication(id: ID!): LoanApplication
    }
  `,
  resolvers: {
    Query: {
      loanApplications: async (_: unknown, args: { limit: number; offset: number }) => {
        const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
        const offset = Math.max(args.offset ?? 0, 0);

        const rows = await prisma.loanApplication.findMany({
          take: limit,
          skip: offset,
          orderBy: { createdAt: "desc" },
        });

        return rows.map((r) => ({
          ...r,
          amount: Number(r.amount),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
      },

      loanApplication: async (_: unknown, args: { id: string }) => {
        const r = await prisma.loanApplication.findUnique({ where: { id: args.id } });
        if (!r) return null;
        return {
          ...r,
          amount: Number(r.amount),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      },
    },

    Mutation: {
      createLoanApplication: async (_: unknown, args: { input: any }) => {
        const parsed = CreateLoanApplicationInputSchema.parse(args.input);

        const created = await prisma.loanApplication.create({
          data: {
            fullName: parsed.fullName,
            email: parsed.email,
            amount: parsed.amount, // Prisma Decimal accepts number
            termMonths: parsed.termMonths,
            purpose: parsed.purpose,
            status: "DRAFT",
          },
        });

        return {
          ...created,
          amount: Number(created.amount),
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      },

      updateLoanApplication: async (_: unknown, args: { id: string; input: any }) => {
        const parsed = UpdateLoanApplicationInputSchema.parse(args.input);

        const updated = await prisma.loanApplication.update({
          where: { id: args.id },
          data: {
            ...(parsed.fullName !== undefined ? { fullName: parsed.fullName } : {}),
            ...(parsed.email !== undefined ? { email: parsed.email } : {}),
            ...(parsed.amount !== undefined ? { amount: parsed.amount } : {}),
            ...(parsed.termMonths !== undefined ? { termMonths: parsed.termMonths } : {}),
            ...(parsed.purpose !== undefined ? { purpose: parsed.purpose } : {}),
            ...(parsed.status !== undefined ? { status: parsed.status } : {}),
          },
        }).catch((e) => {
          // If record doesn't exist, Prisma throws; return null for GraphQL ergonomics
          if (String(e?.code) === "P2025") return null;
          throw e;
        });

        if (!updated) return null;

        return {
          ...updated,
          amount: Number(updated.amount),
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      },

      deleteLoanApplication: async (_: unknown, args: { id: string }) => {
        const deleted = await prisma.loanApplication.delete({ where: { id: args.id } }).catch((e) => {
          if (String(e?.code) === "P2025") return null;
          throw e;
        });
        return Boolean(deleted);
      },

      submitLoanApplication: async (_: unknown, args: { id: string }) => {
        const updated = await prisma.loanApplication.update({
          where: { id: args.id },
          data: { status: "SUBMITTED" },
        }).catch((e) => {
          if (String(e?.code) === "P2025") return null;
          throw e;
        });

        if (!updated) return null;
        return {
          ...updated,
          amount: Number(updated.amount),
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      },

      approveLoanApplication: async (_: unknown, args: { id: string }) => {
        const updated = await prisma.loanApplication.update({
          where: { id: args.id },
          data: { status: "APPROVED" },
        }).catch((e) => {
          if (String(e?.code) === "P2025") return null;
          throw e;
        });

        if (!updated) return null;
        return {
          ...updated,
          amount: Number(updated.amount),
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      },

      rejectLoanApplication: async (_: unknown, args: { id: string }) => {
        const updated = await prisma.loanApplication.update({
          where: { id: args.id },
          data: { status: "REJECTED" },
        }).catch((e) => {
          if (String(e?.code) === "P2025") return null;
          throw e;
        });

        if (!updated) return null;
        return {
          ...updated,
          amount: Number(updated.amount),
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      },
    },
  },
});
