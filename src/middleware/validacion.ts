import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleErroresEntrada = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};
