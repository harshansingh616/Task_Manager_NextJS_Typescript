import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";

type ListParams = {
  userId: string;
  page: number;
  limit: number;
  status?: "completed" | "pending";
  search?: string;
};

type CreateParams = {
  userId: string;
  title: string;
  description?: string;
};

type UpdateParams = {
  userId: string;
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
};

export class TaskService {
  static async list(params: ListParams) {
    const { userId, page, limit, status, search } = params;

    const where: any = { userId };

    if (status) where.completed = status === "completed";
    if (search) where.title = { contains: search, mode: "insensitive" };

    const skip = (page - 1) * limit;

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async create(params: CreateParams) {
    return prisma.task.create({
      data: {
        userId: params.userId,
        title: params.title,
        description: params.description,
      },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async getById(userId: string, id: string) {
    const task = await prisma.task.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!task) throw new HttpError(404, "Task not found");
    return task;
  }

  static async update(params: UpdateParams) {
    await this.getById(params.userId, params.id);

    return prisma.task.update({
      where: { id: params.id },
      data: {
        title: params.title,
        description: params.description,
        completed: params.completed,
      },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async remove(userId: string, id: string) {
    await this.getById(userId, id);

    await prisma.task.delete({ where: { id } });
  }

  static async toggle(userId: string, id: string) {
    const task = await this.getById(userId, id);

    return prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}