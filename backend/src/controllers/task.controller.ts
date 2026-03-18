import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

type IdParams = { id: string };

export class TaskController {
  static async list(req: Request, res: Response) {
    const userId = req.user!.id;

    const { page, limit, status, search } = req.validatedQuery as {
      page: number;
      limit: number;
      status?: "completed" | "pending";
      search?: string;
    };

    const result = await TaskService.list({ userId, page, limit, status, search });
    return res.json(result);
  }

  static async create(req: Request, res: Response) {
    const userId = req.user!.id;

    const { title, description } = req.validatedBody as {
      title: string;
      description?: string;
    };

    const task = await TaskService.create({ userId, title, description });
    return res.status(201).json(task);
  }

  static async get(req: Request<IdParams>, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id;

    const task = await TaskService.getById(userId, id);
    return res.json(task);
  }

  static async update(req: Request<IdParams>, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id;

    const task = await TaskService.update({ userId, id, ...(req.validatedBody as object) });
    return res.json(task);
  }

  static async remove(req: Request<IdParams>, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id;

    await TaskService.remove(userId, id);
    return res.status(204).send();
  }

  static async toggle(req: Request<IdParams>, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id;

    const task = await TaskService.toggle(userId, id);
    return res.json(task);
  }
}