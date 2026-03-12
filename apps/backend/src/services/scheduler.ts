import cron from "node-cron";
import { prisma } from "@repo/db";
import { generateCasesExcel, CaseExportData } from "../lib/excel";
import { sendAdminExportEmail } from "../lib/mail";
import { syncStaleCases, syncUpcomingHearings } from "./sync";

/**
 * Runs the export logic: fetches data, generates excel, and emails the admin.
 */
export const runAdminExport = async () => {
  try {
    // 1. Fetch all admins from DB
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    if (admins.length === 0) {
      console.warn(
        "No users with ADMIN role found in DB, skipping scheduled export",
      );
      return;
    }

    const adminEmails = admins.map((admin) => admin.email);

    // 2. Fetch all users and their saved cases
    const users = await prisma.user.findMany({
      include: {
        savedCases: true,
      },
    });

    const exportData: CaseExportData[] = [];

    // 3. Flatten the data
    for (const user of users) {
      for (const c of user.savedCases) {
        exportData.push({
          userEmail: user.email,
          caseType: c.caseType,
          caseNo: c.caseNo,
          caseYear: c.caseYear,
          petName: c.petName,
          resName: c.resName,
          status: c.status,
        });
      }
    }

    if (exportData.length === 0) {
      console.log("No cases to export");
      return;
    }

    // 4. Generate Excel
    const buffer = generateCasesExcel(exportData);

    // 5. Send Email to all Admins
    for (const email of adminEmails) {
      await sendAdminExportEmail(email, buffer);
    }
    console.log(
      `Daily export sent successfully to ${adminEmails.length} admin(s)`,
    );
  } catch (error) {
    console.error("Error in runAdminExport:", error);
  }
};

/**
 * Starts all scheduled tasks for the backend.
 */
export const startScheduledTasks = () => {
  // Run daily midnight export job (IST)
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("Starting daily midnight export job...");
      await runAdminExport();
    },
    { timezone: "Asia/Kolkata" },
  );

  // Run daily case sync job at 03:00 AM (IST)
  cron.schedule(
    "0 3 * * *",
    async () => {
      console.log("Starting daily case sync job...");
      await syncStaleCases();
    },
    { timezone: "Asia/Kolkata" },
  );

  // Run hourly cause list sync job (IST)
  cron.schedule(
    "0 * * * *",
    async () => {
      console.log("Starting hourly cause list sync job...");
      await syncUpcomingHearings();
    },
    { timezone: "Asia/Kolkata" },
  );

  console.log(
    "Scheduler initialized: Daily export at 00:00, Daily sync at 03:00, Hourly cause list sync",
  );
};
