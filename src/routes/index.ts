import { Router } from "express";
import healthRoutes from "./healthRoutes";
import helperRoutes from "./helperRoutes";
import producerRoutes from "./producerRoutes";

const router = Router();

router.use(healthRoutes);
router.use(helperRoutes);
router.use(producerRoutes);

export default router;
