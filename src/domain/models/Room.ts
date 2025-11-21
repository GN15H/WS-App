
export interface IRoomMap {
  id: number;
  name: string;
  description: string;
  owner_id: number;
}

interface IRoom {
  id: number;
  name: string;
  description: string;
  ownerId: number;
}

export class Room {
  id: number;
  name: string;
  description: string;
  ownerId: number;

  constructor({ id, name, description, ownerId }: IRoom) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ownerId = ownerId;
  }

  static fromMap({ id, name, description, owner_id }: IRoomMap): Room {
    return new Room({
      id: id,
      name: name,
      description: description,
      ownerId: owner_id
    })
  }
}
