import type { Request, Response } from "express";
import Nota, { INota } from "../models/Nota";
import { Types } from "mongoose";

type NotaParams = {
  idNota: Types.ObjectId;
};

export class NotaController {
  static crearNota = async (req: Request<{}, {}, INota>, res: Response) => {
    const { contenido } = req.body;

    const nota = new Nota();
    nota.contenido = contenido;
    nota.creadoPor = req.usuario.id;
    nota.tarea = req.tarea.id;

    req.tarea.notas.push(nota.id);

    try {
      await Promise.allSettled([req.tarea.save(), nota.save()]);
      res.send("Nota creada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static obtenerNotasDeTarea = async (req: Request, res: Response) => {
    try {
      const notas = await Nota.find({ tarea: req.tarea.id });
      res.json(notas);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static eliminarNotaDeTarea = async (
    req: Request<NotaParams>,
    res: Response
  ) => {
    const { idNota } = req.params;

    const nota = await Nota.findById(idNota);

    if (!nota) {
      const error = new Error("Nota no encontrada");
      return res.status(404).json({ error: error.message });
    }

    if (nota.creadoPor.toString() !== req.usuario.id.toString()) {
      const error = new Error("Acción no válida");
      return res.status(401).json({ error: error.message });
    }

    req.tarea.notas = req.tarea.notas.filter(
      (nota) => nota.toString() !== idNota.toString()
    );

    try {
      await Promise.allSettled([req.tarea.save(), nota.deleteOne()]);
      res.send("Nota eliminada");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
