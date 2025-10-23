import bcrypt from "bcrypt";

export const hashContrasena = async (contrasena: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(contrasena, salt);
};
