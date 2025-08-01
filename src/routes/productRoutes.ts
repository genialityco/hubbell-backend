// src/routes/productRoutes.ts
import { Router } from "express";
import {
  createProduct,
  getProductByCodeQuery,
  getCompatibles,
  getProducts,
  searchProducts,
  updateProductCompatibles,
} from "../controllers/productController";

const router = Router();

router.post("/", createProduct);
router.post("/search", searchProducts);
router.get("/", getProducts);
router.get("/code", getProductByCodeQuery);
router.get("/:code/compatibles", getCompatibles);
router.patch("/code/:code/compatibles", updateProductCompatibles);


export default router;
