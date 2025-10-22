import { Request, Response } from "express";

export class AutenticacionController {
  static crearCuenta = async (req: Request, res: Response) => {
    res.send("Desde controller auth, test");
  };
}
