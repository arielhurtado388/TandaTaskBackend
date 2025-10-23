import { Request, Response } from "express";
import Usuario from "../models/Usuario";
import { hashContrasena, revisarContrasena } from "../utils/autenticacion";
import Token from "../models/Token";
import { generarToken } from "../utils/token";
import { transporter } from "../config/nodemailer";
import { AutenticacionCorreo } from "../correos/AutenticacionCorreo";

export class AutenticacionController {
  static crearCuenta = async (req: Request, res: Response) => {
    try {
      const { contrasena, correo } = req.body;

      // Prevenir duplicados
      const existeUsuario = await Usuario.findOne({ correo });

      if (existeUsuario) {
        const error = new Error("El usuario ya está registrado");
        return res.status(409).json({ error: error.message });
      }

      // Crea el usuario
      const usuario = new Usuario(req.body);

      // Hash contraseña
      usuario.contrasena = await hashContrasena(contrasena);

      // Generar token
      const token = new Token();
      token.token = generarToken();
      token.usuario = usuario.id;

      // Enviar correo
      AutenticacionCorreo.enviarCorreoConfirmacion({
        correo: usuario.correo,
        nombre: usuario.nombre,
        token: token.token,
      });

      await Promise.allSettled([usuario.save(), token.save()]);

      res.send(
        "Cuenta creada correctamente, revisa tu correo para confirmarla"
      );
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static confirmarCuenta = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const existeToken = await Token.findOne({ token });
      if (!existeToken) {
        const error = new Error("El código no es válido");
        return res.status(404).json({ error: error.message });
      }

      const usuario = await Usuario.findById(existeToken.usuario);
      usuario.confirmado = true;

      await Promise.allSettled([usuario.save(), existeToken.deleteOne()]);

      res.send("Cuenta confirmada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static iniciarSesion = async (req: Request, res: Response) => {
    try {
      const { correo, contrasena } = req.body;

      const usuario = await Usuario.findOne({ correo });

      if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(401).json({ error: error.message });
      }
      if (!usuario.confirmado) {
        const token = new Token();
        token.usuario = usuario.id;
        token.token = generarToken();
        await token.save();

        AutenticacionCorreo.enviarCorreoConfirmacion({
          correo: usuario.correo,
          nombre: usuario.nombre,
          token: token.token,
        });

        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un correo de confirmación"
        );

        return res.status(404).json({ error: error.message });
      }

      const esContrasenaCorrecta = await revisarContrasena(
        contrasena,
        usuario.contrasena
      );

      if (!esContrasenaCorrecta) {
        const error = new Error("La contraseña es incorrecta");
        return res.status(401).json({ error: error.message });
      }
      res.send("Autenticado...");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
