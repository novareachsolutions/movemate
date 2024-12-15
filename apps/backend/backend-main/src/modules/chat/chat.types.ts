export type TChatMessageInput = {
  channelId: string;
  senderId: number;
  recipientId?: number;
  message: string;
};
