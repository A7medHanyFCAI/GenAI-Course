
export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface MessageAttachment {
    url: string;
    type: string;
}

export interface Message {
  id: string;
  sender: Sender;
  text?: string;
  attachment?: MessageAttachment;
}

export interface Attachment {
    file: File;
    base64: string;
    mimeType: string;
}
