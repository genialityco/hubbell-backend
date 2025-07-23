// src/controllers/productController.ts
import { Request, Response } from "express";
import Product, { IProduct } from "../models/Product";

// Crear producto (con compatibles)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = req.body as Partial<IProduct>;
    if (!data.code || !data.name) {
      return res
        .status(400)
        .json({ message: "Faltan campos obligatorios (code, name)" });
    }
    // Asegúrate que compatibles sea un array aunque esté vacío
    data.compatibles = data.compatibles ?? [];
    const created = await Product.create(data);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Error creando producto", error: err });
  }
};

// Listar todos los productos
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json({
      products,
      total: products.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error });
  }
};

// Traer producto por código (SKU)
export const getProductByCode = async (req: Request, res: Response) => {
  const code = req.params.code;
  const product = await Product.findOne({ code });
  if (!product) return res.status(404).json({ message: "No encontrado" });
  res.json(product);
};

// Traer productos compatibles de un producto
export const getCompatibles = async (req: Request, res: Response) => {
  const code = req.params.code;
  const product = await Product.findOne({ code });
  if (!product) return res.status(404).json({ message: "No encontrado" });

  // Buscar todos los productos cuyo code esté en compatibles[]
  const compatibles = await Product.find({
    code: { $in: product.compatibles },
  });
  res.json(compatibles);
};
