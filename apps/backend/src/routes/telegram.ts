import { Router, Response } from "express";
import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { prisma } from "@repo/db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { fetchPHHCCase, getISTDayRange, storePHHCCase } from "../services/phhc";
import { sendShareCaseEmail } from "../lib/mail";
import { runAdminExport } from "../services/scheduler";
import type {
  TelegramUser,
  TelegramChat,
  TelegramDocument,
  TelegramPhoto,
  TelegramMessage,
  TelegramUpdate,
  TelegramApiResult,
} from "../types/telegram";

const router = Router();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "";
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const TELEGRAM_FILE_BASE = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}`;
const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ...types moved to ../types/telegram

async function telegramApi<T>(
  method: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(`${TELEGRAM_API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await response.json()) as TelegramApiResult<T>;
  if (!response.ok || !json.ok || !json.result) {
    throw new Error(json.description || `Telegram API ${method} failed`);
  }

  return json.result;
}

async function sendMessage(chatId: number, text: string) {
  const chunks = text.length > 3500 ? splitText(text, 3500) : [text];

  for (const chunk of chunks) {
    await telegramApi("sendMessage", {
      chat_id: chatId,
      text: chunk,
      disable_web_page_preview: true,
    });
  }
}

function splitText(text: string, chunkSize: number) {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > chunkSize) {
    const splitAt = remaining.lastIndexOf("\n", chunkSize);
    const index = splitAt > 0 ? splitAt : chunkSize;
    chunks.push(remaining.slice(0, index));
    remaining = remaining.slice(index).trimStart();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function normalizeCommand(rawText?: string) {
  if (!rawText) return { command: "", args: [] as string[] };
  const parts = rawText.trim().split(/\s+/);
  const rawCommand = parts[0] || "";
  const command = rawCommand.split("@")[0].toLowerCase();
  return { command, args: parts.slice(1) };
}

function formatCaseLine(c: {
  id: string;
  caseType: string;
  caseNo: string;
  caseYear: number;
  status: string | null;
  nextListingDate: Date | null;
}) {
  const listing = c.nextListingDate
    ? new Date(c.nextListingDate).toLocaleDateString("en-IN")
    : "N/A";
  return `${c.caseType}-${c.caseNo}-${c.caseYear} | ${c.id}\nStatus: ${c.status || "N/A"} | Next: ${listing}`;
}

function sanitizeFilename(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.length > 0 ? cleaned : "attachment.bin";
}

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

async function requireSavedCase(userId: string, caseId: string) {
  return prisma.case.findFirst({
    where: {
      id: caseId,
      savedBy: {
        some: { id: userId },
      },
    },
    select: {
      id: true,
    },
  });
}

async function handleStart(
  chatId: number,
  telegramUserId: string,
  payload?: string,
) {
  if (!payload) {
    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      await sendMessage(
        chatId,
        `Account already linked to ${user.name || user.email}. Use /help to see commands.`,
      );
      return;
    }

    await sendMessage(
      chatId,
      "This Telegram account is not linked yet. Generate a link token from your logged-in app session and retry.",
    );
    return;
  }

  const token = await prisma.telegramOnboardingToken.findUnique({
    where: { token: payload },
    include: { user: true },
  });

  if (!token || token.expiresAt < new Date()) {
    await sendMessage(
      chatId,
      "This link has expired or is invalid. Please generate a new link.",
    );
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { telegramUserId },
    }),
    prisma.telegramOnboardingToken.deleteMany({
      where: {
        OR: [{ id: token.id }, { userId: token.userId }],
      },
    }),
  ]);

  await sendMessage(
    chatId,
    `Linked successfully to ${token.user.name || token.user.email}. Use /help to see commands.`,
  );
}

async function handleHelp(chatId: number) {
  await sendMessage(
    chatId,
    [
      "Telegram Bot Commands",
      "/help",
      "/me",
      "/cases",
      "/case <caseId>",
      "/fetch <caseType> <caseNo> <caseYear>",
      "/save <caseType> <caseNo> <caseYear> OR /save <caseId>",
      "/unsave <caseId>",
      "/cause_list",
      "/refresh <caseId>",
      "/share <caseId> <email1,email2>",
      "/note_set <caseId> <note text>",
      "/note_delete <caseId>",
      "/shared_note_add <caseId> <note text>",
      "/shared_note_delete <noteId>",
      "",
      "File Upload",
      "Send a document/photo with caption: /attach <caseId> [title]",
    ].join("\n"),
  );
}

async function handleAttachmentMessage(
  chatId: number,
  userId: string,
  message: TelegramMessage,
) {
  const captionCommand = normalizeCommand(message.caption);
  if (captionCommand.command !== "/attach") {
    await sendMessage(
      chatId,
      "To save a file, send it with caption: /attach <caseId> [title]",
    );
    return;
  }

  const [caseId, ...titleParts] = captionCommand.args;
  if (!caseId || !isUuid(caseId)) {
    await sendMessage(chatId, "Invalid case ID. Use: /attach <caseId> [title]");
    return;
  }

  const savedCase = await requireSavedCase(userId, caseId);
  if (!savedCase) {
    await sendMessage(
      chatId,
      "You can attach files only to cases saved by you.",
    );
    return;
  }

  const fileFromDocument = message.document
    ? {
        fileId: message.document.file_id,
        fileSize: message.document.file_size,
        originalName: message.document.file_name || "attachment.bin",
        mimeType: message.document.mime_type || null,
      }
    : null;

  const largestPhoto = message.photo?.[message.photo.length - 1];
  const fileFromPhoto = largestPhoto
    ? {
        fileId: largestPhoto.file_id,
        fileSize: largestPhoto.file_size,
        originalName: `photo-${Date.now()}.jpg`,
        mimeType: "image/jpeg",
      }
    : null;

  const file = fileFromDocument || fileFromPhoto;
  if (!file) {
    await sendMessage(chatId, "No file found in this message.");
    return;
  }

  if (file.fileSize && file.fileSize > MAX_ATTACHMENT_BYTES) {
    await sendMessage(chatId, "File too large. Max allowed size is 100MB.");
    return;
  }

  const fileMeta = await telegramApi<{ file_path: string }>("getFile", {
    file_id: file.fileId,
  });

  const downloadResponse = await fetch(
    `${TELEGRAM_FILE_BASE}/${fileMeta.file_path}`,
  );
  if (!downloadResponse.ok) {
    await sendMessage(chatId, "Failed to download file from Telegram.");
    return;
  }

  const bytes = Buffer.from(await downloadResponse.arrayBuffer());
  const safeOriginalName = sanitizeFilename(file.originalName);
  const extension = path.extname(safeOriginalName);
  const storedName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const uploadDir = path.resolve(
    process.cwd(),
    "../../uploads/case-attachments",
    caseId,
  );

  await mkdir(uploadDir, { recursive: true });
  const absolutePath = path.join(uploadDir, storedName);
  await writeFile(absolutePath, bytes);

  await prisma.caseAttachment.create({
    data: {
      caseId,
      uploaderId: userId,
      title: titleParts.length > 0 ? titleParts.join(" ") : null,
      telegramFileId: file.fileId,
      filename: storedName,
      originalName: safeOriginalName,
      mimetype: file.mimeType,
      size: file.fileSize || bytes.length,
    },
  });

  await sendMessage(chatId, `Attachment saved for case ${caseId}.`);
}

async function handleCommand(
  chatId: number,
  command: string,
  args: string[],
  user: {
    id: string;
    role: "ADMIN" | "USER";
    email: string;
    name: string | null;
  },
) {
  if (command === "/help") {
    await handleHelp(chatId);
    return;
  }

  if (command === "/me") {
    await sendMessage(
      chatId,
      `Linked user\nName: ${user.name || "N/A"}\nEmail: ${user.email}\nRole: ${user.role}`,
    );
    return;
  }

  if (command === "/cases") {
    const rows = await prisma.case.findMany({
      where: {
        savedBy: {
          some: { id: user.id },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        caseType: true,
        caseNo: true,
        caseYear: true,
        status: true,
        nextListingDate: true,
      },
    });

    if (rows.length === 0) {
      await sendMessage(chatId, "No saved cases found.");
      return;
    }

    const message = [
      "Saved cases:",
      ...rows.map((c) => formatCaseLine(c)),
    ].join("\n\n");
    await sendMessage(chatId, message);
    return;
  }

  if (command === "/case") {
    const caseId = args[0];
    if (!caseId || !isUuid(caseId)) {
      await sendMessage(chatId, "Usage: /case <caseId>");
      return;
    }

    const item = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        hearings: true,
        orders: true,
        personalNotes: { where: { userId: user.id } },
        sharedNotes: { orderBy: { createdAt: "asc" }, take: 20 },
      },
    });

    if (!item) {
      await sendMessage(chatId, "Case not found.");
      return;
    }

    await sendMessage(
      chatId,
      [
        formatCaseLine(item),
        `Hearings: ${item.hearings.length}`,
        `Orders: ${item.orders.length}`,
        `Personal note: ${item.personalNotes[0]?.content || "None"}`,
        `Shared notes: ${item.sharedNotes.length}`,
      ].join("\n"),
    );
    return;
  }

  if (command === "/fetch") {
    if (args.length < 3) {
      await sendMessage(chatId, "Usage: /fetch <caseType> <caseNo> <caseYear>");
      return;
    }

    const [caseTypeRaw, caseNo, caseYearRaw] = args;
    const caseType = caseTypeRaw.toUpperCase();
    const caseYear = Number(caseYearRaw);

    if (!Number.isInteger(caseYear) || caseYear < 1900 || caseYear > 2100) {
      await sendMessage(chatId, "Invalid case year.");
      return;
    }

    const data = await fetchPHHCCase({
      case_type: caseType,
      case_no: caseNo,
      case_year: caseYear,
    });

    if (!data) {
      await sendMessage(chatId, "Case not found on PHHC.");
      return;
    }

    await sendMessage(
      chatId,
      [
        "Case fetched from PHHC:",
        `${data.caseData.case_type}-${data.caseData.case_no}-${data.caseData.case_year}`,
        `Petitioner: ${data.caseData.pet_name || "N/A"}`,
        `Respondent: ${data.caseData.res_name || "N/A"}`,
        `Status: ${data.caseData.status?.status_desc || "N/A"}`,
      ].join("\n"),
    );
    return;
  }

  if (command === "/save") {
    if (args.length < 1) {
      await sendMessage(
        chatId,
        "Usage: /save <caseType> <caseNo> <caseYear> OR /save <caseId>",
      );
      return;
    }

    let caseId: string | null = null;

    if (args.length === 1 && isUuid(args[0])) {
      caseId = args[0];
      const caseRecord = await prisma.case.findUnique({
        where: { id: caseId },
      });
      if (!caseRecord) {
        await sendMessage(chatId, "Case not found.");
        return;
      }
    } else if (args.length >= 3) {
      const caseType = args[0].toUpperCase();
      const caseNo = args[1];
      const caseYear = Number(args[2]);

      if (!Number.isInteger(caseYear) || caseYear < 1900 || caseYear > 2100) {
        await sendMessage(chatId, "Invalid case year.");
        return;
      }

      const data = await fetchPHHCCase({
        case_type: caseType,
        case_no: caseNo,
        case_year: caseYear,
      });

      if (!data) {
        await sendMessage(chatId, "Case not found on PHHC.");
        return;
      }

      const stored = await storePHHCCase(
        {
          case_type: caseType,
          case_no: caseNo,
          case_year: caseYear,
        },
        data,
      );

      if (!stored) {
        await sendMessage(chatId, "Failed to persist case.");
        return;
      }

      caseId = stored.id;
    }

    if (!caseId) {
      await sendMessage(
        chatId,
        "Usage: /save <caseType> <caseNo> <caseYear> OR /save <caseId>",
      );
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        savedCases: {
          connect: { id: caseId },
        },
      },
    });

    await sendMessage(chatId, `Case saved successfully: ${caseId}`);
    return;
  }

  if (command === "/unsave") {
    const caseId = args[0];
    if (!caseId || !isUuid(caseId)) {
      await sendMessage(chatId, "Usage: /unsave <caseId>");
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          savedCases: {
            disconnect: { id: caseId },
          },
        },
      });

      const c = await tx.case.findUnique({
        where: { id: caseId },
        include: { _count: { select: { savedBy: true } } },
      });

      if (c && c._count.savedBy === 0) {
        await tx.case.delete({ where: { id: caseId } });
      }
    });

    await sendMessage(chatId, "Case unsaved successfully.");
    return;
  }

  if (command === "/cause_list") {
    const { start, end } = getISTDayRange();
    const hearings = await prisma.caseHearing.findMany({
      where: {
        hearingDate: { gte: start, lte: end },
        case: {
          savedBy: {
            some: { id: user.id },
          },
        },
      },
      include: {
        case: {
          select: {
            id: true,
            caseType: true,
            caseNo: true,
            caseYear: true,
          },
        },
      },
      orderBy: { hearingDate: "asc" },
      take: 100,
    });

    if (hearings.length === 0) {
      await sendMessage(chatId, "No hearings found for today/tomorrow.");
      return;
    }

    const lines = hearings.map((h) => {
      const date = new Date(h.hearingDate).toLocaleDateString("en-IN");
      return `${date} | ${h.case.caseType}-${h.case.caseNo}-${h.case.caseYear} | court ${h.courtNo || "N/A"} | sr ${h.srNo || "N/A"}`;
    });

    await sendMessage(chatId, ["Cause list:", ...lines].join("\n"));
    return;
  }

  if (command === "/refresh") {
    const caseId = args[0];
    if (!caseId || !isUuid(caseId)) {
      await sendMessage(chatId, "Usage: /refresh <caseId>");
      return;
    }

    const caseRecord = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord) {
      await sendMessage(chatId, "Case not found.");
      return;
    }

    const data = await fetchPHHCCase({
      case_type: caseRecord.caseType,
      case_no: caseRecord.caseNo,
      case_year: caseRecord.caseYear,
    });

    if (!data) {
      await sendMessage(chatId, "Case not found on PHHC.");
      return;
    }

    await storePHHCCase(
      {
        case_type: caseRecord.caseType,
        case_no: caseRecord.caseNo,
        case_year: caseRecord.caseYear,
      },
      data,
    );

    await sendMessage(chatId, "Case refreshed successfully.");
    return;
  }

  if (command === "/share") {
    if (args.length < 2) {
      await sendMessage(chatId, "Usage: /share <caseId> <email1,email2>");
      return;
    }

    const caseId = args[0];
    const emails = args[1]
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (!isUuid(caseId) || emails.length === 0) {
      await sendMessage(chatId, "Invalid input for /share.");
      return;
    }

    const caseRecord = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseRecord) {
      await sendMessage(chatId, "Case not found.");
      return;
    }

    const sharer = user.name || user.email;
    await Promise.all(
      emails.map((email) => sendShareCaseEmail(email, caseId, sharer)),
    );

    await sendMessage(chatId, "Case shared successfully.");
    return;
  }

  if (command === "/note_set") {
    const caseId = args[0];
    const content = args.slice(1).join(" ").trim();

    if (!caseId || !isUuid(caseId) || !content) {
      await sendMessage(chatId, "Usage: /note_set <caseId> <note text>");
      return;
    }

    await prisma.personalNote.upsert({
      where: {
        userId_caseId: {
          userId: user.id,
          caseId,
        },
      },
      create: {
        userId: user.id,
        caseId,
        content,
      },
      update: { content },
    });

    await sendMessage(chatId, "Personal note saved.");
    return;
  }

  if (command === "/note_delete") {
    const caseId = args[0];
    if (!caseId || !isUuid(caseId)) {
      await sendMessage(chatId, "Usage: /note_delete <caseId>");
      return;
    }

    await prisma.personalNote.deleteMany({
      where: {
        userId: user.id,
        caseId,
      },
    });

    await sendMessage(chatId, "Personal note deleted.");
    return;
  }

  if (command === "/shared_note_add") {
    const caseId = args[0];
    const content = args.slice(1).join(" ").trim();

    if (!caseId || !isUuid(caseId) || !content) {
      await sendMessage(chatId, "Usage: /shared_note_add <caseId> <note text>");
      return;
    }

    await prisma.sharedNote.create({
      data: {
        userId: user.id,
        caseId,
        content,
      },
    });

    await sendMessage(chatId, "Shared note added.");
    return;
  }

  if (command === "/shared_note_delete") {
    const noteId = args[0];
    if (!noteId || !isUuid(noteId)) {
      await sendMessage(chatId, "Usage: /shared_note_delete <noteId>");
      return;
    }

    const note = await prisma.sharedNote.findUnique({ where: { id: noteId } });
    if (!note) {
      await sendMessage(chatId, "Shared note not found.");
      return;
    }
    if (note.userId !== user.id) {
      await sendMessage(chatId, "Only the author can delete this shared note.");
      return;
    }

    await prisma.sharedNote.delete({ where: { id: noteId } });
    await sendMessage(chatId, "Shared note deleted.");
    return;
  }

  // ...existing code...

  await sendMessage(chatId, "Unknown command. Use /help.");
}

router.post(
  "/link",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!TELEGRAM_BOT_USERNAME) {
      return res.status(500).json({
        error: "TELEGRAM_BOT_USERNAME is not configured",
      });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.telegramOnboardingToken.deleteMany({ where: { userId } });
    await prisma.telegramOnboardingToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    const deepLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${token}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(deepLink)}`;

    return res.json({
      deepLink,
      qrImageUrl,
      expiresAt,
    });
  },
);

router.get(
  "/status",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramUserId: true,
      },
    });

    return res.json({
      linked: !!user?.telegramUserId,
      telegramUserId: user?.telegramUserId || null,
    });
  },
);

router.post("/webhook", async (req: AuthRequest, res: Response) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res
      .status(500)
      .json({ error: "TELEGRAM_BOT_TOKEN is not configured" });
  }

  if (TELEGRAM_WEBHOOK_SECRET) {
    const header = req.headers["x-telegram-bot-api-secret-token"];
    if (header !== TELEGRAM_WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Invalid webhook secret" });
    }
  }

  const update = req.body as TelegramUpdate;
  const message = update.message;

  if (!message || !message.from) {
    return res.sendStatus(200);
  }

  const chatId = message.chat.id;
  const telegramUserId = String(message.from.id);

  try {
    const { command, args } = normalizeCommand(message.text);

    if (command === "/start") {
      await handleStart(chatId, telegramUserId, args[0]);
      return res.sendStatus(200);
    }

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      await sendMessage(
        chatId,
        "This Telegram account is not linked. Generate a link token in your app and scan/open it first.",
      );
      return res.sendStatus(200);
    }

    if (message.document || message.photo) {
      await handleAttachmentMessage(chatId, user.id, message);
      return res.sendStatus(200);
    }

    if (command.startsWith("/")) {
      await handleCommand(chatId, command, args, user);
      return res.sendStatus(200);
    }

    await sendMessage(chatId, "Send a command or use /help.");
    return res.sendStatus(200);
  } catch (error) {
    console.error("Telegram webhook error:", error);

    try {
      await sendMessage(
        chatId,
        "Something went wrong while processing your request.",
      );
    } catch (sendError) {
      console.error("Failed to send Telegram error message:", sendError);
    }

    return res.sendStatus(200);
  }
});

export default router;
