import { Room } from "../../domain/models/Room"
import type { User } from "../../domain/models/User"

interface IActiveRoom {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  active: boolean;
}

export class ActiveRoom extends Room {
  active: boolean

  constructor({ id, name, description, ownerId, active }: IActiveRoom) {
    super({ id: id, name: name, description: description, ownerId: ownerId });
    this.active = active;
  }
}

export type RoomUser = {
  active: boolean,
  user: User
}
