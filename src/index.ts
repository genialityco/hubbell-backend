import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes";

dotenv.config();
const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"] 
}));

app.use(express.json());

// Ruta de prueba para verificar el despliegue
app.get("/", (req, res) => {
  res.status(200).json({
    message: "¡Backend desplegado exitosamente en Vercel!",
    status: "active",
    routes: {
      products: "/api/products"
    }
  });
});

// Rutas principales
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Backend running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));

// Exporta la app para Vercel (¡importante!)
export default app;