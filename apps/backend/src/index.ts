import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import casesRouter from "./routes/cases";
import adminRouter from "./routes/admin";
import { startScheduledTasks } from "./services/scheduler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/cases", casesRouter);
app.use("/api/admin", adminRouter);

// Start scheduled tasks (e.g., daily midnight export)
startScheduledTasks();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
