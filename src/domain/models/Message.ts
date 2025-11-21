
export interface IMessageMap {
  id: number;
  room_id: number;
  user_id: number;
  message: string;
  sent_at: Date;
}

interface IMessage {
  id: number;
  roomId: number;
  userId: number;
  message: string;
  sentAt: Date;
}

export class Message {
  id: number;
  roomId: number;
  userId: number;
  message: string;
  sentAt: Date;

  constructor({ id, roomId, userId, message, sentAt }: IMessage) {
    this.id = id;
    this.roomId = roomId;
    this.userId = userId;
    this.message = message;
    this.sentAt = sentAt;
  }

  static fromMap({ id, room_id, user_id, message, sent_at }: IMessageMap): Message {
    return new Message({
      id: id,
      roomId: room_id,
      userId: user_id,
      message: message,
      sentAt: sent_at,
    })

  }

}
