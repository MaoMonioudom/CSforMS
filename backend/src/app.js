import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import communityRoutes from "./modules/community/community.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import learningRoutes from "./modules/learning/learning.routes.js";
import membershipRoutes from "./modules/membership/membership.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/community", communityRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/learning", learningRoutes);
  app.use("/api/membership", membershipRoutes);

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errorHandler);

  return app;
}
