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
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query = "", categories = [] } = req.body;
    const categoriesArr = Array.isArray(categories) ? categories : [categories];

    // Filtro para productos a mostrar
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

    // Productos filtrados a mostrar
    const products = await Product.find(filter);

    // Filtros (types) globales o por búsqueda
    let filters: { types: { name: string; count: number }[] } = { types: [] };

    if (query) {
      // Si hay query, solo los tipos que aparecen en los productos filtrados
      const typesInResults = await Product.distinct("type", filter);
      const typeCounts: Record<string, number> = {};
      typesInResults.forEach((type) => {
        typeCounts[type || "Sin tipo"] = 0;
      });
      products.forEach((prod) => {
        const type = prod.type || "Sin tipo";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      filters.types = typesInResults.map((type) => ({
        name: type || "Sin tipo",
        count: typeCounts[type || "Sin tipo"] || 0,
      }));
    } else {
      // Si NO hay query, cuenta los tipos globales en TODO el catálogo
      const allTypes = await Product.distinct("type");
      const typeCounts: Record<string, number> = {};
      for (const type of allTypes) {
        typeCounts[type || "Sin tipo"] = await Product.countDocuments({ type });
      }
      filters.types = allTypes.map((type) => ({
        name: type || "Sin tipo",
        count: typeCounts[type || "Sin tipo"] || 0,
      }));
    }

    res.json({
      products,
      filters,
      total: products.length,
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
