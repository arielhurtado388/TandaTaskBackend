import express from "express";
import dotenv from "dotenv";
import { conexionDB } from "./config/db";
import proyectoRoutes from "./routes/proyectoRoutes";

dotenv.config({ quiet: true });

conexionDB();

const app = express();

app.use(express.json());

// Routes
app.use("/api/proyectos", proyectoRoutes);

export default app;
