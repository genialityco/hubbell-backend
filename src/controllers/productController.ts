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

// Busca productos por query y categorías seleccionadas
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query = "", categories = [] } = req.body;
    const categoriesArr = Array.isArray(categories) ? categories : [categories];
    // Construir el filtro dinámico
    const filter: any = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { code: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
      ];
    }
    if (categoriesArr.length > 0) {
      filter.type = { $in: categoriesArr };
    }

    const products = await Product.find(filter);
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ message: "Error en búsqueda", error: err });
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
