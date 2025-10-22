import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const listaBlanca = [process.env.FRONTEND_URL];

    if (process.argv[2] === "--api") {
      listaBlanca.push(undefined);
    }

    if (listaBlanca.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Error de CORS"));
    }
  },
};
