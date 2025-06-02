import { Router } from "express";
import asyncHandler from "express-async-handler";
import { ProducerController } from "../controllers/producerController";
import { HelperController } from "../controllers/helperController";
import { HealthController } from "../controllers/healthController";

const router = Router();

// main API endpoint
router.get(
  "/api/producers/prize-intervals",
  asyncHandler(ProducerController.getProducerIntervals)
);

// health check endpoint
router.get("/health", HealthController.getHealth);

// helper endpoints (for debugging/exploration)
router.get("/movies", asyncHandler(HelperController.getMovies));
router.get("/producers", asyncHandler(HelperController.getProducers));
router.get(
  "/movie-producers",
  asyncHandler(HelperController.getMovieProducers)
);

export default router;
