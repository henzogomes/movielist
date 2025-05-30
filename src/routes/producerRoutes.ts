import { Router } from "express";
import { ProducerController } from "../controllers/producerController";

const router = Router();

// endpoint principal - retorna os intervalos minimos e máximos
router.get(
  "/api/producers/prize-intervals",
  ProducerController.getProducerIntervals
);

export default router;
