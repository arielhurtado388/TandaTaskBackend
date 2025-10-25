import mongoose, { Schema, Document, Types } from "mongoose";

const estadosTarea = {
  PENDIENTE: "pendiente",
  EN_ESPERA: "enEspera",
  EN_PROGRESO: "enProgreso",
  BAJO_REVISION: "bajoRevision",
  COMPLETA: "completa",
} as const;

export type EstadosTarea = (typeof estadosTarea)[keyof typeof estadosTarea];

export interface ITarea extends Document {
  nombre: string;
  descripcion: string;
  proyecto: Types.ObjectId;
  estado: EstadosTarea;
  completadoPor: Types.ObjectId;
}

export const TareaSchema: Schema = new Schema(
  {
    nombre: {
      type: String,
      trim: true,
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      required: true,
    },
    proyecto: {
      type: Types.ObjectId,
      ref: "Proyecto",
    },
    estado: {
      type: String,
      enum: Object.values(estadosTarea),
      default: estadosTarea.PENDIENTE,
    },
    completadoPor: {
      type: Types.ObjectId,
      ref: "Usuario",
      default: null,
    },
  },

  { timestamps: true }
);

const Tarea = mongoose.model<ITarea>("Tarea", TareaSchema);

export default Tarea;
