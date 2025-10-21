import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { corsConfig } from "./config/cors";
import { conexionDB } from "./config/db";
import proyectoRoutes from "./routes/proyectoRoutes";

dotenv.config({ quiet: true });

conexionDB();

const app = express();

app.use(cors(corsConfig));

// Logging
app.use(morgan("dev"));

// Leer datos de formularios
app.use(express.json());

// Routes
app.use("/api/proyectos", proyectoRoutes);

export default app;
