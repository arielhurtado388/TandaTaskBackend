import { transporter } from "../config/nodemailer";

interface ICorreo {
  correo: string;
  nombre: string;
  token: string;
}

export class AutenticacionCorreo {
  static enviarCorreoConfirmacion = async (usuario: ICorreo) => {
    const info = await transporter.sendMail({
      from: "TandaTask <cuentas@tandatask.com>",
      to: usuario.correo,
      subject: "Confirma tu cuenta",
      text: "Confirma tu cuenta",
      html: `
      <p>
      Hola ${usuario.nombre}, has creado tu cuenta en TandaTask ya casi está todo listo, solo debes confirmar tu cuenta 
      </p>
      <p>Visita el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/auth/confirmar-cuenta">Confirmar cuenta</a>
      <p>e ingresa el código: <b>${usuario.token}</b></p>
      <p>Este código expira en 10 minutos</p>
      `,
    });
    console.log("Mensaje enviado", info);
  };

  static enviarCorreoResetearContrasena = async (usuario: ICorreo) => {
    const info = await transporter.sendMail({
      from: "TandaTask <cuentas@tandatask.com>",
      to: usuario.correo,
      subject: "Reestablece tu contraseña",
      text: "Reestablece tu contraseña",
      html: `
      <p>
      Hola ${usuario.nombre}, has solicitado reestablecer tu contraseña. 
      </p>
      <p>Visita el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/auth/olvide">Reestablecer contraseña</a>
      <p>e ingresa el código: <b>${usuario.token}</b></p>
      <p>Este código expira en 10 minutos</p>
      `,
    });
    console.log("Mensaje enviado", info);
  };
}
