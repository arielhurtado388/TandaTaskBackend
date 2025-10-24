import jwt from "jsonwebtoken";
import { Types } from "mongoose";

type PayloadUsuario = {
  id: Types.ObjectId;
};

export const generarJWT = (payload: PayloadUsuario) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "180d",
  });
  return token;
};
