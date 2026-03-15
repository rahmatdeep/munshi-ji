// Telegram API TypeScript interfaces

export interface TelegramUser {
  id: number;
}

export interface TelegramChat {
  id: number;
}

export interface TelegramDocument {
  file_id: string;
  file_size?: number;
  file_name?: string;
  mime_type?: string;
}

export interface TelegramPhoto {
  file_id: string;
  file_size?: number;
}

export interface TelegramMessage {
  text?: string;
  caption?: string;
  from?: TelegramUser;
  chat: TelegramChat;
  document?: TelegramDocument;
  photo?: TelegramPhoto[];
}

export interface TelegramUpdate {
  message?: TelegramMessage;
}

export interface TelegramApiResult<T> {
  ok: boolean;
  result?: T;
  description?: string;
}
