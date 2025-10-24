import { Request, Response } from "express";
import Proyecto from "../models/Proyecto";

export class ProyectoController {
  static crearProyecto = async (req: Request, res: Response) => {
    const proyecto = new Proyecto(req.body);

    // Asignar propietario
    proyecto.propietario = req.usuario.id;

    try {
      await proyecto.save();
      res.send("Proyecto creado correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static obtenerProyectos = async (req: Request, res: Response) => {
    try {
      const proyectos = await Proyecto.find({
        $or: [{ propietario: { $in: req.usuario.id } }],
      });
      res.json(proyectos);
    } catch (error) {
      console.log(error);
    }
  };

  static obtenerProyectoPorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const proyecto = await Proyecto.findById(id).populate("tareas");
      if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (proyecto.propietario.toString() !== req.usuario.id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(404).json({ error: error.message });
      }

      res.json(proyecto);
    } catch (error) {
      console.log(error);
    }
  };

  static actualizarProyecto = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const proyecto = await Proyecto.findById(id);
      if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (proyecto.propietario.toString() !== req.usuario.id.toString()) {
        const error = new Error(
          "Solo el propietario puede actualizar un proyecto"
        );
        return res.status(404).json({ error: error.message });
      }

      proyecto.nombreCliente = req.body.nombreCliente;
      proyecto.nombreProyecto = req.body.nombreProyecto;
      proyecto.descripcion = req.body.descripcion;

      await proyecto.save();
      res.send("Proyecto actualizado");
    } catch (error) {
      console.log(error);
    }
  };

  static eliminarProyecto = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const proyecto = await Proyecto.findById(id);
      if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (proyecto.propietario.toString() !== req.usuario.id.toString()) {
        const error = new Error(
          "Solo el propietario puede eliminar un proyecto"
        );
        return res.status(404).json({ error: error.message });
      }

      await proyecto.deleteOne();
      res.send("Proyecto eliminado");
    } catch (error) {
      console.log(error);
    }
  };
}
