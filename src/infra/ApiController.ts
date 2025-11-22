import axios from "axios";
import { Room, type IRoomMap } from "../domain/models/Room";

export class ApiController {

  async getRooms() {
    const token = localStorage.getItem('token');
    const req = await axios.get(import.meta.env.VITE_API_URI + '/rooms', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const rooms: Room[] = req.data.map((r: IRoomMap) => ({ id: r['id'], name: r['name'], description: r['description'], }))
    return rooms;
  }

  async createRoom(name: string, description: string) {
    const token = localStorage.getItem('token');
    const req = await axios.post(import.meta.env.VITE_API_URI + '/rooms/create', {
      name: name,
      description: description
    },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    const rooms: Room = Room.fromMap(req.data);
    return rooms;
  }
}
