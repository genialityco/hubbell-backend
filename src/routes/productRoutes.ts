// src/routes/productRoutes.ts
import { Router } from "express";
import {
  createProduct,
  getProductByCodeQuery,
  getCompatibles,
  getProducts,
  searchProducts,
} from "../controllers/productController";

const router = Router();

router.post("/", createProduct);
router.post("/search", searchProducts);
router.get("/", getProducts);
router.get("/code", getProductByCodeQuery);
router.get("/:code/compatibles", getCompatibles);

export default router;
