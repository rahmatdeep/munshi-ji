import { fetchAndStorePHHCCase, parseISTDate, getISTDayRange } from "./phhc";
import { prisma } from "@repo/db";

/**
 * Syncs cases that have a hearing today or tomorrow.
 * This ensures the cause list (court no, sr no) is always up to date.
 */
export async function syncUpcomingHearings() {
  console.log("Starting sync of upcoming hearings (Cause List)...");

  const { start, end } = getISTDayRange();

  // Find all cases that have a hearing within the next 48 hours
  const hearings = await prisma.caseHearing.findMany({
    where: {
      hearingDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      case: {
        select: {
          caseType: true,
          caseNo: true,
          caseYear: true,
          lastSyncedAt: true,
        },
      },
    },
  });

  // Unique list of cases to sync
  const uniqueCases = Array.from(
    new Map(hearings.map((h) => [h.caseId, h.case])).values()
  );

  console.log(`Found ${uniqueCases.length} unique cases with upcoming hearings.`);

  for (const c of uniqueCases) {
    try {
      // For upcoming hearings, we sync if not synced in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (!c.lastSyncedAt || c.lastSyncedAt < oneHourAgo) {
        console.log(`Syncing upcoming case: ${c.caseType} ${c.caseNo}/${c.caseYear}`);
        await fetchAndStorePHHCCase({
          case_type: c.caseType,
          case_no: c.caseNo,
          case_year: c.caseYear,
        });
        // Small throttle
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error(
        `Failed to sync upcoming case ${c.caseType} ${c.caseNo}/${c.caseYear}:`,
        error,
      );
    }
  }

  console.log("Upcoming hearings sync completed.");
}

/**
 * Syncs cases that have a passed nextListingDate and are still PENDING.
 * It also checks cases that haven't been synced in the last 24 hours.
 */
export async function syncStaleCases() {
  console.log("Starting sync of stale cases...");

  const now = parseISTDate(new Date().toISOString())!;
  
  // Find cases:
  // 1. Status is PENDING (adjust string as per your DB data)
  // 2. nextListingDate is in the past
  // 3. lastSyncedAt is null OR older than 24 hours
  const staleCases = await prisma.case.findMany({
    where: {
      status: {
        contains: "PENDING",
        mode: "insensitive",
      },
      nextListingDate: {
        lt: now,
      },
      OR: [
        { lastSyncedAt: null },
        {
          lastSyncedAt: {
            lt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
    select: {
      caseType: true,
      caseNo: true,
      caseYear: true,
    },
  });

  console.log(`Found ${staleCases.length} stale cases to sync.`);

  for (const c of staleCases) {
    try {
      console.log(`Syncing case: ${c.caseType} ${c.caseNo}/${c.caseYear}`);
      await fetchAndStorePHHCCase({
        case_type: c.caseType,
        case_no: c.caseNo,
        case_year: c.caseYear,
      });
      
      // Throttle to be polite to the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(
        `Failed to sync case ${c.caseType} ${c.caseNo}/${c.caseYear}:`,
        error,
      );
    }
  }

  console.log("Stale cases sync completed.");
}