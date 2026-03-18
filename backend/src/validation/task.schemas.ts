import { z } from "zod";

const toInt = (v: unknown) => {
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return v;
};

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    completed: z.boolean().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, "At least one field is required");

export const listTasksQuerySchema = z.object({
  page: z.preprocess(toInt, z.number().int().min(1).default(1)),
  limit: z.preprocess(toInt, z.number().int().min(1).max(100).default(10)),
  status: z.enum(["completed", "pending"]).optional(),
  search: z.string().trim().min(1).max(200).optional(),
});