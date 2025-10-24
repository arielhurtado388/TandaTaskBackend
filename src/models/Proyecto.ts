import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import { ITarea } from "./Tarea";
import { IUsuario } from "./Usuario";

export interface IProyecto extends Document {
  nombreProyecto: string;
  nombreCliente: string;
  descripcion: string;
  tareas: PopulatedDoc<ITarea & Document>[];
  propietario: PopulatedDoc<IUsuario & Document>;
}

const ProyectoSchema: Schema = new Schema(
  {
    nombreProyecto: {
      type: String,
      required: true,
      trim: true,
    },
    nombreCliente: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    tareas: [
      {
        type: Types.ObjectId,
        ref: "Tarea",
      },
    ],
    propietario: {
      type: Types.ObjectId,
      ref: "Usuario",
    },
  },
  { timestamps: true }
);

const Proyecto = mongoose.model<IProyecto>("Proyecto", ProyectoSchema);

export default Proyecto;
