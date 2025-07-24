// src/routes/productRoutes.ts
import { Router } from "express";
import {
  createProduct,
  getProductByCode,
  getCompatibles,
  getProducts,
  searchProducts,
} from "../controllers/productController";

const router = Router();

router.post("/", createProduct);
router.post("/search", searchProducts);
router.get("/", getProducts);
router.get("/:code", getProductByCode);
router.get("/:code/compatibles", getCompatibles);

export default router;
