import type { Request, Response, NextFunction } from "express";
import Tarea, { ITarea } from "../models/Tarea";

declare global {
  namespace Express {
    interface Request {
      tarea: ITarea;
    }
  }
}

export async function existeTarea(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { idTarea } = req.params;
    const tarea = await Tarea.findById(idTarea);
    if (!tarea) {
      const error = new Error("Tarea no encontrada");
      return res.status(404).json({ error: error.message });
    }
    req.tarea = tarea;
    next();
  } catch (error) {
    res.status(500).json({ error: "Hubo un error" });
  }
}

export function tareaPerteneceAProyecto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.tarea.proyecto.toString() !== req.proyecto.id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(400).json({ error: error.message });
  }
  next();
}

export function tieneAutorizacion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.usuario.id.toString() !== req.proyecto.propietario.toString()) {
    const error = new Error("Acción no válida");
    return res.status(400).json({ error: error.message });
  }
  next();
}
