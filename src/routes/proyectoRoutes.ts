import { Router } from "express";
import { ProyectoController } from "../controllers/ProyectoController";
import { body, param } from "express-validator";
import { handleErroresEntrada } from "../middleware/validacion";
import { TareaController } from "../controllers/TareaController";
import { existeProyecto } from "../middleware/proyecto";
import {
  existeTarea,
  tareaPerteneceAProyecto,
  tieneAutorizacion,
} from "../middleware/tarea";
import { autenticado } from "../middleware/auth";
import { EquipoController } from "../controllers/EquipoController";
import { NotaController } from "../controllers/NotaController";

const router = Router();

router.use(autenticado);

router.post(
  "/",
  body("nombreProyecto")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("nombreCliente")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria"),
  handleErroresEntrada,
  ProyectoController.crearProyecto
);
router.get("/", ProyectoController.obtenerProyectos);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("El id no es válido"),
  handleErroresEntrada,
  ProyectoController.obtenerProyectoPorId
);

router.put(
  "/:id",
  param("id").isMongoId().withMessage("El id no es válido"),
  body("nombreProyecto")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("nombreCliente")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria"),
  handleErroresEntrada,
  ProyectoController.actualizarProyecto
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("El id no es válido"),
  handleErroresEntrada,
  ProyectoController.eliminarProyecto
);

// Rutas para tareas
router.param("idProyecto", existeProyecto);

router.post(
  "/:idProyecto/tareas",
  tieneAutorizacion,
  body("nombre").notEmpty().withMessage("El nombre de la tarea es obligatoria"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleErroresEntrada,
  TareaController.crearTarea
);

router.get("/:idProyecto/tareas", TareaController.obtenerTareasPorProyecto);

router.param("idTarea", existeTarea);
router.param("idTarea", tareaPerteneceAProyecto);

router.get(
  "/:idProyecto/tareas/:idTarea",
  param("idTarea").isMongoId().withMessage("El id no es válido"),
  handleErroresEntrada,
  TareaController.obtenerTareaPorId
);

router.put(
  "/:idProyecto/tareas/:idTarea",
  tieneAutorizacion,
  param("idTarea").isMongoId().withMessage("El id no es válido"),
  body("nombre").notEmpty().withMessage("El nombre de la tarea es obligatoria"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleErroresEntrada,
  TareaController.actualizarTarea
);

router.delete(
  "/:idProyecto/tareas/:idTarea",
  tieneAutorizacion,
  param("idTarea").isMongoId().withMessage("El id no es válido"),
  handleErroresEntrada,
  TareaController.eliminarTarea
);

router.post(
  "/:idProyecto/tareas/:idTarea/estado",
  param("idTarea").isMongoId().withMessage("El id no es válido"),
  body("estado").notEmpty().withMessage("El estado es obligatorio"),
  handleErroresEntrada,
  TareaController.actualizarEstado
);

// Rutas para equipo
router.post(
  "/:idProyecto/equipo/buscar",
  body("correo").isEmail().toLowerCase().withMessage("El correo no es válido"),
  handleErroresEntrada,
  EquipoController.buscarMiembroPorCorreo
);

router.get("/:idProyecto/equipo", EquipoController.obtenerMiembrosEquipo);

router.post(
  "/:idProyecto/equipo",
  body("id").isMongoId().withMessage("El id no es válido"),
  handleErroresEntrada,
  EquipoController.agregarMiembroPorId
);

router.delete(
  "/:idProyecto/equipo/:idUsuario",
  param("idUsuario").isMongoId().withMessage("El id no es válido"),
  handleErroresEntrada,
  EquipoController.eliminarMiembroPorId
);

// Rutas para notas
router.post(
  "/:idProyecto/tareas/:idTarea/notas",
  body("contenido").notEmpty().withMessage("El contenido es obligatorio"),
  handleErroresEntrada,
  NotaController.crearNota
);

router.get(
  "/:idProyecto/tareas/:idTarea/notas",
  NotaController.obtenerNotasDeTarea
);

router.delete(
  "/:idProyecto/tareas/:idTarea/notas/:idNota",
  param("idNota").isMongoId().withMessage("El id no es válido"),
  handleErroresEntrada,
  NotaController.eliminarNotaDeTarea
);

export default router;
