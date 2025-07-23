// src/routes/productRoutes.ts
import { Router } from "express";
import {
  createProduct,
  getProductByCode,
  getCompatibles,
  getProducts,
} from "../controllers/productController";

const router = Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:code", getProductByCode);
router.get("/:code/compatibles", getCompatibles);

export default router;
