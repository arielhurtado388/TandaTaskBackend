import mongoose, { Schema, Document } from "mongoose";

export interface IUsuario extends Document {
  correo: string;
  contrasena: string;
  nombre: string;
  confirmado: boolean;
}

const UsuarioSchema: Schema = new Schema({
  correo: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  contrasena: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  confirmado: {
    type: Boolean,
    default: false,
  },
});

const Usuario = mongoose.model<IUsuario>("Usuario", UsuarioSchema);

export default Usuario;
