import type { Request, Response } from "express";
import Tarea from "../models/Tarea";

export class TareaController {
  static crearTarea = async (req: Request, res: Response) => {
    try {
      const tarea = new Tarea(req.body);
      tarea.proyecto = req.proyecto.id;
      req.proyecto.tareas.push(tarea.id);
      await Promise.allSettled([tarea.save(), req.proyecto.save()]);
      res.send("Tarea creada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static obtenerTareasPorProyecto = async (req: Request, res: Response) => {
    try {
      const tareas = await Tarea.find({ proyecto: req.proyecto.id }).populate(
        "proyecto"
      );

      res.json(tareas);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static obtenerTareaPorId = async (req: Request, res: Response) => {
    try {
      res.json(req.tarea);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static actualizarTarea = async (req: Request, res: Response) => {
    try {
      req.tarea.nombre = req.body.nombre;
      req.tarea.descripcion = req.body.descripcion;
      await req.tarea.save();
      res.send("Tarea actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static eliminarTarea = async (req: Request, res: Response) => {
    try {
      req.proyecto.tareas = req.proyecto.tareas.filter(
        (tarea) => tarea.toString() !== req.tarea.id.toString()
      );
      await Promise.allSettled([req.tarea.deleteOne(), req.proyecto.save()]);
      res.send("Tarea eliminada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static actualizarEstado = async (req: Request, res: Response) => {
    try {
      const { estado } = req.body;
      req.tarea.estado = estado;

      if (estado === "pendiente") {
        req.tarea.completadoPor = null;
      } else {
        req.tarea.completadoPor = req.usuario.id;
      }

      await req.tarea.save();
      res.send("Tarea actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
