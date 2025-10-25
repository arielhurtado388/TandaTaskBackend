import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Usuario, { IUsuario } from "../models/Usuario";

declare global {
  namespace Express {
    interface Request {
      usuario?: IUsuario;
    }
  }
}

export const autenticado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error("No autorizado");
    return res.status(401).json({ error: error.message });
  }
  //   const token = bearer.split(" ")[1];
  const [, token] = bearer.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "object" && decoded.id) {
      const usuario = await Usuario.findById(decoded.id).select(
        "_id nombre correo"
      );
      if (usuario) {
        req.usuario = usuario;
        next();
      } else {
        res.status(500).json({ error: "El token no es válido" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "El token no es válido" });
  }
};
