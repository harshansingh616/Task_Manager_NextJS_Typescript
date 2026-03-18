import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { TaskController } from "../controllers/task.controller";
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from "../validation/task.schemas";

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get("/", validateQuery(listTasksQuerySchema), TaskController.list);
taskRouter.post("/", validateBody(createTaskSchema), TaskController.create);
taskRouter.patch("/:id", validateBody(updateTaskSchema), TaskController.update);
taskRouter.get("/:id", TaskController.get);
taskRouter.delete("/:id", TaskController.remove);

taskRouter.post("/:id/toggle", TaskController.toggle);