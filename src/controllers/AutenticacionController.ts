import { Request, Response } from "express";
import Usuario from "../models/Usuario";
import { hashContrasena, revisarContrasena } from "../utils/autenticacion";
import Token from "../models/Token";
import { generarToken } from "../utils/token";
import { transporter } from "../config/nodemailer";
import { AutenticacionCorreo } from "../correos/AutenticacionCorreo";
import { generarJWT } from "../utils/jwt";

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

      const token = generarJWT({ id: usuario.id });

      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static requerirCodigoConfirmacion = async (req: Request, res: Response) => {
    try {
      const { correo } = req.body;
      const usuario = await Usuario.findOne({ correo });

      if (!usuario) {
        const error = new Error("El usuario no está registrado");
        return res.status(404).json({ error: error.message });
      }

      if (usuario.confirmado) {
        const error = new Error("El usuario ya está confirmado");
        return res.status(403).json({ error: error.message });
      }

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

      res.send("Se envió un nuevo código a tu correo");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static olvideContrasena = async (req: Request, res: Response) => {
    try {
      const { correo } = req.body;
      const usuario = await Usuario.findOne({ correo });

      if (!usuario) {
        const error = new Error("El usuario no está registrado");
        return res.status(404).json({ error: error.message });
      }

      // Generar token
      const token = new Token();
      token.token = generarToken();
      token.usuario = usuario.id;

      await token.save();

      // Enviar correo
      AutenticacionCorreo.enviarCorreoResetearContrasena({
        correo: usuario.correo,
        nombre: usuario.nombre,
        token: token.token,
      });

      res.send("Revisa tu correo y sigue las instrucciones");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static validarToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const existeToken = await Token.findOne({ token });
      if (!existeToken) {
        const error = new Error("El código no es válido");
        return res.status(404).json({ error: error.message });
      }

      res.send("El token es válido, define tu nueva contraseña");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static actualizarContrasenaConToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const existeToken = await Token.findOne({ token });
      if (!existeToken) {
        const error = new Error("El código no es válido");
        return res.status(404).json({ error: error.message });
      }

      const usuario = await Usuario.findById(existeToken.usuario);
      usuario.contrasena = await hashContrasena(req.body.contrasena);

      await Promise.allSettled([usuario.save(), existeToken.deleteOne()]);

      res.send("La contraseña se modificó correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static usuario = async (req: Request, res: Response) => {
    return res.json(req.usuario);
  };

  static actualizarPerfil = async (req: Request, res: Response) => {
    const { nombre, correo } = req.body;

    const existeUsuario = await Usuario.findOne({ correo });

    if (
      existeUsuario &&
      existeUsuario.id.toString() !== req.usuario.id.toString()
    ) {
      const error = new Error("El correo ya está registrado");
      return res.status(409).json({ error: error.message });
    }

    req.usuario.nombre = nombre;
    req.usuario.correo = correo;

    try {
      await req.usuario.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static actualizarContrasena = async (req: Request, res: Response) => {
    const { contrasena_actual, contrasena } = req.body;

    const usuario = await Usuario.findById(req.usuario.id);

    const esContrasenaCorrecta = await revisarContrasena(
      contrasena_actual,
      usuario.contrasena
    );

    if (!esContrasenaCorrecta) {
      const error = new Error("La contraseña actual es incorrecta");
      return res.status(401).json({ error: error.message });
    }

    try {
      usuario.contrasena = await hashContrasena(contrasena);
      await usuario.save();
      res.send("La contraseña se modificó correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static verificarContrasena = async (req: Request, res: Response) => {
    const { contrasena } = req.body;

    const usuario = await Usuario.findById(req.usuario.id);

    const esContrasenaCorrecta = await revisarContrasena(
      contrasena,
      usuario.contrasena
    );

    if (!esContrasenaCorrecta) {
      const error = new Error("La contraseña es incorrecta");
      return res.status(401).json({ error: error.message });
    }

    res.send("Contraseña correcta");
  };
}
