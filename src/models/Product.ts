import { Schema, model, Document } from "mongoose";

export interface ICompatible {
  type: string; // Ej: "Conector a superficie plana"
  code: string; // Ej: "YA25"
}

export interface IProduct extends Document {
  code: string;
  name: string;
  brand?: string;
  provider?: string;
  group?: string;
  line?: string;
  image?: string;
  type?: string;
  datasheet?: string;
  compatibles?: ICompatible[]; // <- Mejor tipado aquí
  price?: number;
  stock?: number;
}

const CompatibleSchema = new Schema<ICompatible>(
  {
    type: { type: String, required: true },
    code: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String },
  provider: { type: String, default: "Provider" },
  group: { type: String },
  line: { type: String },
  image: { type: String },
  type: { type: String },
  datasheet: { type: String },
  compatibles: [CompatibleSchema], // ahora bien tipado
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
});

export default model<IProduct>("Product", ProductSchema);
