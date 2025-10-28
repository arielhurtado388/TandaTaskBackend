import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Tarea, { ITarea } from "./Tarea";
import { IUsuario } from "./Usuario";
import Nota from "./Nota";

export interface IProyecto extends Document {
  nombreProyecto: string;
  nombreCliente: string;
  descripcion: string;
  tareas: PopulatedDoc<ITarea & Document>[];
  propietario: PopulatedDoc<IUsuario & Document>;
  equipo: PopulatedDoc<IUsuario & Document>[];
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
    equipo: [
      {
        type: Types.ObjectId,
        ref: "Usuario",
      },
    ],
  },
  { timestamps: true }
);

// Middleware
ProyectoSchema.pre(
  "deleteOne",
  {
    document: true,
  },
  async function () {
    const idProyecto = this._id;
    if (!idProyecto) return;

    const tareas = await Tarea.find({ proyecto: idProyecto });
    for (const tarea of tareas) {
      await Nota.deleteMany({ tarea: tarea.id });
    }
    await Tarea.deleteMany({ proyecto: idProyecto });
  }
);

const Proyecto = mongoose.model<IProyecto>("Proyecto", ProyectoSchema);

export default Proyecto;
