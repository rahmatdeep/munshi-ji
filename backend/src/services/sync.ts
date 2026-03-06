import prisma from "../lib/prisma";
import { fetchAndStorePHHCCase } from "./phhc";

/**
 * Syncs cases that have a passed nextListingDate and are still PENDING.
 * It also checks cases that haven't been synced in the last 24 hours.
 */
export async function syncStaleCases() {
  console.log("Starting sync of stale cases...");

  const now = new Date();
  
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
