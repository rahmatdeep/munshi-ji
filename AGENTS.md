# Monorepo & Project Guidelines

## General Rules

- **Package Manager**: ALWAYS use `pnpm` for this project. Never use `npm` or `yarn`.
- **Authentication**: Use Magic Link Login via Resend. Password-based authentication is removed.
- **Email Service**: Use Resend for all communications.
- **Database**: Prisma with PostgreSQL.
- **Styling**: Tailwind CSS v4.

## Prisma Client Usage

- Do NOT install @prisma/client in individual app packages (e.g., backend, frontend) if you have a shared db package (e.g., @repo/db) that exports the Prisma client.
- Always import and use the Prisma client from the shared db package (e.g., import { prisma } from '@repo/db').
- After making changes to the Prisma schema, always run `prisma generate` in the shared db package to update the generated client for all consumers.
- If you see errors like Property 'caseAttachment' does not exist on type 'PrismaClient', it usually means the generated client is out of date.
- The backend and other consumers should never need to run `prisma generate` or install @prisma/client directly; they rely on the shared package.
