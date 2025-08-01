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

// Busca productos por query y categorías seleccionadas y devuelve filtros tipo
// Busca productos con paginación
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query = "", categories = [], page = 1, limit = 20 } = req.body;
    const categoriesArr = Array.isArray(categories) ? categories : [categories];

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

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    // Construir filtros (idéntico a antes)
    const typeCounts: Record<string, number> = {};
    const typesInResults = await Product.distinct("type", query ? filter : {});
    for (const type of typesInResults) {
      typeCounts[type || "Sin tipo"] = await Product.countDocuments({
        ...filter,
        type,
      });
    }

    const filters = {
      types: typesInResults.map((type) => ({
        name: type || "Sin tipo",
        count: typeCounts[type || "Sin tipo"] || 0,
      })),
    };

    res.json({
      products,
      filters,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
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
// src/controllers/productController.ts
export const getProductByCodeQuery = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  // 1. Buscar el producto principal
  const product = await Product.findOne({ code });
  if (!product) return res.status(404).json({ message: "No encontrado" });

  // 2. Productos que este producto tiene como compatibles
  const compatibleCodes = (product.compatibles || []).map((c) => c.code);
  const compatibles = await Product.find({ code: { $in: compatibleCodes } });

  // 3. Productos que tienen este producto como compatible
  const compatibleWith = await Product.find({ "compatibles.code": code });

  res.json({
    product,
    compatibles, // <-- Los productos a los que este producto apunta
    compatibleWith, // <-- Los productos que apuntan a este producto
  });
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

export const updateProductCompatibles = async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    const { compatibles } = req.body; // [{ code, type }, ...]
    const updated = await Product.findOneAndUpdate(
      { code },
      { compatibles },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "No encontrado" });
    res.json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error actualizando compatibles", error: err });
  }
};
