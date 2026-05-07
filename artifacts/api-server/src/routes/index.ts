import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reactionsRouter from "./reactions";
import candidatesRouter from "./candidates";
import experimentsRouter from "./experiments";
import annotationsRouter from "./annotations";
import retrainingRouter from "./retraining";
import dashboardRouter from "./dashboard";
import exportRouter from "./export";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(reactionsRouter);
router.use(candidatesRouter);
router.use(experimentsRouter);
router.use(annotationsRouter);
router.use(retrainingRouter);
router.use(exportRouter);

export default router;
