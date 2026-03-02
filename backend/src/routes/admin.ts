import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { runAdminExport } from "../services/scheduler";
import prisma from "../lib/prisma";

const router = Router();

/**
 * POST /api/admin/export-cases
 * Manually triggers the daily Excel export to the Admin.
 * Restricted to ADMIN role.
 */
router.post(
  "/export-cases",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<Response | void> => {
    // Role check
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }

    try {
      await runAdminExport();
      return res.json({ message: "Manual export triggered and email sent" });
    } catch (error) {
      console.error("Manual export error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * GET /api/admin/users
 * Lists all registered users in the system.
 * Restricted to ADMIN role.
 */
router.get(
  "/users",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<Response | void> => {
    // Role check
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }

    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      return res.json({ users });
    } catch (error) {
      console.error("Fetch users error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
