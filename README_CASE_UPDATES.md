# Case Update System - Implementation Summary

This document summarizes the backend changes made to support automated and manual case data refreshes, and outlines the potential work for the frontend.

## Backend Changes (Completed)

### 1. Database Schema

- **Field**: `lastSyncedAt DateTime?` added to the `Case` model in `backend/prisma/schema.prisma`.
- **Purpose**: Tracks the last successful synchronization with the PHHC API.

### 2. Services

- **`syncStaleCases` (`backend/src/services/sync.ts`)**:
  - Identifies cases with `status: "PENDING"` and a `nextListingDate` in the past.
  - Refreshes those that haven't been synced in the last 24 hours.
  - Throttles API requests (500ms delay) to avoid rate limiting.
- **`storePHHCCase` (`backend/src/services/phhc.ts`)**:
  - Automatically updates `lastSyncedAt` to the current time whenever a case is created or updated.

### 3. Automation

- **`scheduler.ts` (`backend/src/services/scheduler.ts`)**:
  - A daily cron job runs at **03:00 AM** to trigger the `syncStaleCases` service.

### 4. API Endpoints

- **Updated**: `/api/cases/fetch`, `/api/cases/saved`, and `/api/cases/:id` now return the `lastSyncedAt` timestamp.
- **New**: `POST /api/cases/:id/refresh` manually triggers an immediate sync for a specific case and returns the fresh details.

---

## Frontend Changes (Suggested)

To fully utilize the new system, the following frontend updates can be implemented:

### 1. Display "Last Refreshed" Date

- **Dashboard**: On each case card, display the `lastSyncedAt` date (e.g., "Last Refreshed: Mar 7, 2026").
- **Case Details**: In the `CaseView` component, add a badge or text showing the last sync time.

### 2. Manual Refresh Button

- **Component**: `CaseDetails.tsx` (or `CaseView.tsx`).
- **Action**: Add a "Refresh Data" button.
- **Implementation**:
  - Call `axios.post(`${API_URL}/api/cases/${id}/refresh`)`.
  - Update the local `caseData` state with the returned fresh data.
  - Handle loading and error states for the refresh action.

### 3. Date Formatting

- Use the existing `formatDate` utility in `frontend/src/lib/date.ts` to display the `lastSyncedAt` timestamp cleanly.
