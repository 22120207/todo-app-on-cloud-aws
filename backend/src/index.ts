// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoute";
import { connectToDatabase } from "./services/database.service";
import logger from "./logger";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Connect to DynamoDB
connectToDatabase().catch((error) => {
  logger.error(`[server]: Database connection error - (${error})`);
  process.exit(1);
});

// Allow the app to accept JSON
app.use(express.json());

// Same-origin policy countermeasure
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/tasks", taskRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`[server]: Something broke on the server!`);
  logger.error(err.stack);
  res.status(500).send("The server is broken!");
});

app.get("/", (_: Request, res: Response) => {
  res.send("Hello from the server!");
});

app.listen(port, '0.0.0.0', () => {
  logger.info(`[server]: Server is running at [http://localhost:${port}]`);
  logger.info(`[Server]: Using Ctrl + C to shut down the server\n`);
});
