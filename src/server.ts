import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { conexionDB } from "./config/db";
import proyectoRoutes from "./routes/proyectoRoutes";

dotenv.config({ quiet: true });

conexionDB();

const app = express();

app.use(cors(corsConfig));

app.use(express.json());

// Routes
app.use("/api/proyectos", proyectoRoutes);

export default app;
