import { Router } from "express";
import { AutenticacionController } from "../controllers/AutenticacionController";
import { body } from "express-validator";
import { handleErroresEntrada } from "../middleware/validacion";

const router = Router();

router.post(
  "/crear-cuenta",
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("correo").isEmail().withMessage("El correo no es válido"),
  body("contrasena")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres"),
  body("contrasena_confirmacion").custom((value, { req }) => {
    if (value !== req.body.contrasena) {
      throw new Error("Las contraseñas no son iguales");
    }
    return true;
  }),
  handleErroresEntrada,
  AutenticacionController.crearCuenta
);

router.post(
  "/confirmar-cuenta",
  body("token").notEmpty().withMessage("El token es obligatorio"),
  handleErroresEntrada,
  AutenticacionController.confirmarCuenta
);

router.post(
  "/iniciar-sesion",
  body("correo").isEmail().withMessage("El correo no es válido"),
  body("contrasena").notEmpty().withMessage("La contraseña es obligatoria"),
  handleErroresEntrada,
  AutenticacionController.iniciarSesion
);

router.post(
  "/requerir-codigo",
  body("correo").isEmail().withMessage("El correo no es válido"),
  handleErroresEntrada,
  AutenticacionController.requerirCodigoConfirmacion
);

router.post(
  "/olvide",
  body("correo").isEmail().withMessage("El correo no es válido"),
  handleErroresEntrada,
  AutenticacionController.olvideContrasena
);

export default router;
