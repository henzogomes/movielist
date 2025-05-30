import { Router } from "express";
import { HelperController as HelperController } from "../controllers/helperController";

const router = Router();

router.get("/movies", HelperController.getMovies);
router.get("/producers", HelperController.getProducers);
router.get("/movie-producers", HelperController.getMovieProducers);

export default router;
