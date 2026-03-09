import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { runAdminExport } from "../services/scheduler";
import { prisma } from "@repo/db";

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
 * Lists users. Admins get full details, standard users get basic info for sharing.
 */
router.get(
  "/users",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
      const isAdmin = req.user?.role === "ADMIN";

      const users = await prisma.user.findMany({
        orderBy: isAdmin ? { createdAt: "desc" } : { name: "asc" },
        select: {
          id: true,
          email: true,
          name: true,
          ...(isAdmin && {
            role: true,
            createdAt: true,
          }),
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
