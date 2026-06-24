import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import commentsRouter from "./comments";
import usersRouter from "./users";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tasksRouter);
router.use(commentsRouter);
router.use(usersRouter);
router.use(statsRouter);

export default router;
