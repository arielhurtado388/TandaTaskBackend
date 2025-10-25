import type { Request, Response } from "express";
import Usuario from "../models/Usuario";
import Proyecto from "../models/Proyecto";

export class EquipoController {
  static buscarMiembroPorCorreo = async (req: Request, res: Response) => {
    const { correo } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findOne({ correo }).select(
      "_id nombre correo"
    );

    if (!usuario) {
      const error = new Error("El usuario no existe");
      return res.status(404).json({ error: error.message });
    }

    res.json(usuario);
  };

  static obtenerMiembrosEquipo = async (req: Request, res: Response) => {
    const proyecto = await Proyecto.findById(req.proyecto.id).populate({
      path: "equipo",
      select: "id nombre correo",
    });
    res.json(proyecto.equipo);
  };

  static agregarMiembroPorId = async (req: Request, res: Response) => {
    const { id } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findById(id).select("_id");

    if (!usuario) {
      const error = new Error("El usuario no existe");
      return res.status(404).json({ error: error.message });
    }
    if (req.proyecto.propietario.toString() === usuario.id.toString()) {
      const error = new Error("El propietario ya es miembro del equipo");
      return res.status(409).json({ error: error.message });
    }

    if (
      req.proyecto.equipo.some(
        (equipo) => equipo.toString() === usuario.id.toString()
      )
    ) {
      const error = new Error("El usuario ya es miembro del equipo");
      return res.status(409).json({ error: error.message });
    }

    req.proyecto.equipo.push(usuario.id);

    await req.proyecto.save();

    res.send("El usuario se agregó correctamente");
  };

  static eliminarMiembroPorId = async (req: Request, res: Response) => {
    const { id } = req.body;

    if (
      !req.proyecto.equipo.some((equipo) => equipo.toString() === id.toString())
    ) {
      const error = new Error("El usuario no existe en el proyecto");
      return res.status(409).json({ error: error.message });
    }

    req.proyecto.equipo = req.proyecto.equipo.filter(
      (miembro) => miembro.toString() !== id.toString()
    );

    await req.proyecto.save();

    res.send("El usuario se eliminó correctamente");
  };
}
